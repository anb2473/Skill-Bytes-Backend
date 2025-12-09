# Skill Bytes Backend
The Skill Bytes Backend service is the core server framework for the Skill Bytes service. Skill Bytes is an educational platform designed to aid in the learning of new programming concepts, and allow programmers to avoid decay in programming abilities due to AI. (skill-bytes.netlify.app)

## Overview
The following README is seperated into three sections:
**NOTE:** This README will mention other related repositories, such as the skill-bytes-frontend and skill-bytes-redirect repositories, however will primarily focus on the backend services
1. Technical Details
2. Execution

## Technical Details
All sevices are dockerized, and managed via docker compose. There are two central services:
1. The Node.JS / Express.JS server
2. The Postgres SQL database, which uses the Prisma ORM

### The Node.JS / Express.JS server:
The server includes four routes:
**NOTE:** Static endpoints are included in this description, however are handled seperately in the `skill-bytes-frontend` repository.
1. Root
    - The root endpoints are all static
    - The root endpoints includes the login and auth frontend
    - And the root includes all other auth unprotected endpoints
2. Auth
    - The auth endpoints are all API only
    - The auth endpoints include all session management endpoints (i.e., `login`, `signup`)
    - **ALL** auth endpoints return a JWT session cookie, holding all session data for the user such as the user's ID (JWT cookies expire after one hour)
3. User
    - The user endpoints include both static endpoints and API only endpoints
    - The user endpoints include the frontend for all auth protected endpoints (i.e., `daily-challenge`)
    - **ALL** requests to the user endpoints are redirected through the auth middleware:
        - The auth middleware stops all incomming requests, and checks the request for a JWT session cookie
        - If no cookie is found, or the cookie is invalid, the request is blocked
        - Otherwise, the auth middleware unpacks the JWT cookies user state data, before passing the request on
 4. Admin
    - The admin endpoints are all API only
    - The admin endpoints systems to directly manage the state of the system or database (i.e., `send-challenge`)
    - **ALL** admin requests must include a password hash alongside the request

### Auth
The auth system uses several tools to ensure data and clients remain secure:
**NOTE:** This does not discuss the `sign-up` process, as the only difference between the `login` endpoint and the `sign-up` endpoint is the creation of the user entry
#### Login
- Once a user sends a request to the `login` endpoint a password hash is created, and compared to the hash entry in the PostgresSQL database
    - The PostgresSQL database remains in a seperate Docker image, ensuring seperation of concern
- If the hashes are not equal, the request returns a 403, otherwise the request returns a JWT session cookie, and redirects the user to the user endpoints
    - The JWT session cookie includes data on the users state, such as the users ID
    - The JWT session will automatically expire after one hour
#### Auth Middleware
- When a user attempts to make a request to a user endpoint the request is processed by the auth middleware
- The middleware checks the request to ensure a JWT session cookie exists, and the JWT session is valid
- Once the check is completed, the middleware unpacks user state data (i.e., the users ID), and allows the request to pass to the user endpoints

### Logging
- Every endpoint logs data on the final state of the request
- This data is passed to the Winston logger, which automatically saves logged data to a `.log` file 

## Execution
This guide includes steps to execute the systems in developement and production.

### Developement
To run the services locally (for developement):
**NOTE:** This assumes you already have Docker installed on your system
1. **Build Docker Images:**
    Execute the command `docker compose build`
2. **Build the Prisma Database:**
    Execute the command `docker compose run server npx prisma migrate dev --name init`
3. **Run the Dockerized System:**
    Execute the command `docker compose up`

### Production
To run the services in developement our system uses a self hosting solution for Linux with Docker, tmux, and tmole. If any of those services are not installed, this hosting solution will not be viable. The system also must include a clone of the `skill-bytes-redirect` and `skill-bytes-frontend` directories, at the root
1. **Run the Init Script:**
    Execute the command `./tmux_init.sh`
The `tmux_init.sh` script performs three actions:
- Starts a new tmux session named `Skill-Bytes` with three panes
- Starts the services via docker compose
- And runs the `tmole_watcher.sh` script
The `tmole_watcher.sh` script constantly watches the state of the second pane:
- If no processes are running in the pane the script starts an instance of tmole, and updates the URLs from the skill-bytes-frontend repository and skill-bytes-redirect repository to include the updated URL from tmole's output
- Otherwise, the script waits
