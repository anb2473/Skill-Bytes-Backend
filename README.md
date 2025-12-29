# Skill Bytes Backend

The Skill Bytes Backend service is the core server framework for the Skill Bytes educational platform. Skill Bytes is designed to help developers learn new programming concepts and maintain their programming abilities through daily coding challenges, preventing skill decay due to AI dependency.

**Live Application:** [skill-bytes.netlify.app](https://skill-bytes.netlify.app)

**We Are Also Looking For Contributors!** If you want to join the Skill Bytes project read the [Contributing](#contributing) section.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Authentication & Authorization](#authentication--authorization)
- [Environment Variables](#environment-variables)
- [Development Setup](#development-setup)
- [Production Deployment](#production-deployment)
- [Scripts & Utilities](#scripts--utilities)
- [Logging](#logging)
- [Related Repositories](#related-repositories)
- [Contributing](#contributing)

---

## Overview

Skill Bytes Backend is a Node.js/Express.js REST API server that provides:

- **User Authentication**: Secure user authentication via JWT tokens, and hashed passwords
- **Daily Challenges**:  New challenges each day based on their preferences, pulled from a pool of challenges
- **Admin Tooling**: Admin tools to send messages, send challenges, and perform other tasks
- **PostgreSQL Database**: A PostgreSQL database, with Prisma ORM to connect the database to the Node.js backend.
The backend is fully containerized using Docker and Docker Compose.
**NOTE:** While the backend server does also handle serving the frontend, we will not discuss how the frontend works internally.
---

## Architecture

The backend follows a modular Express.js architecture:

```text
server/
├── server.js             # Main application entry point
├── routes/api            # route handlers for all API endpoints
│   ├── auth/             # authentication endpoints
│   ├── user/             # user-protected endpoints
│   └── admin/            # admin-protected endpoints
├── middleware/           # express middleware
│   ├── authmiddleware.js    # jwt authentication
│   └── adminmiddleware.js   # admin password verification
├── prisma/               # database schema and migrations
├── scripts/              # utility scripts
├── public/               # static frontend assets
├── logger.js             # log manager
├── dockerfile            # docker build instructions
└── logs/                 # application logs
```

Outside of the `server` directory, the project contains a `docker-compose.yaml` and `docker-swarm.yaml`. These files manage deploying all [services](###service-architecture). Read the [COMPOSE.md](docs/deployement/COMPOSE.md) and [SWARM.md](docs/deployement/SWARM.md) for more details.

### service architecture

the application runs three docker containers:

1. **node.js/express server** (`skill-bytes-server`)
   - handles all http requests
   - serves static frontend assets
   - manages api routes and middleware

2. **PostgreSQL database** (`skill-bytes-db`)
   - stores all application data
   - managed via prisma orm
   - persistent data volume

3. **Cloudflared Tunnel** (`cloudflared`)
  - creates a cloudflared tunnel to expose the application to the public network

---

## technology stack

### core technologies
- **runtime**: node.js 22 (alpine linux)
- **framework**: express.js 5.1.0
- **database**: postgresql 13 (alpine)
- **orm**: prisma 6.19.0
- **authentication**: jwt (jsonwebtoken)
- **password hashing**: bcryptjs
- **logging**: winston
- **validation**: validator.js

### key dependencies
- `express`: web framework
- `@prisma/client`: database client
- `jsonwebtoken`: jwt token generation/verification
- `bcryptjs`: password hashing
- `cookie-parser`: cookie parsing middleware
- `cors`: cross-origin resource sharing
- `winston`: logging framework
- `validator`: input validation

---

## database schema

the application uses prisma orm with the following models:

### user model
The user model represents every account. A new user model is created with every request to the `/api/auth/sign-up` endpoint. The model contains three general attribute types:
1. Identifiers such as the accounts id and email
2. Account data such as the accounts preferences and name
3. References to challenge models, such as the accounts previouslycompleted and openchallenge 
```prisma
model user {
  id                    int       @id @default(autoincrement())
  email                 string    @unique
  passw                 string                    // hashed password
  username              string?   @unique
  fname                 string?                   // first name
  createdat             datetime  @default(now())
  inbox                 message[]
  preferences           string[]  @default([])     // topic preferences
  languages             string    @default("javascript")
  previouslycompleted   int[]     @default([])    // challenge ids
  completedchallenges   int[]     @default([])    // completed challenge ids
  openchallenge         challenge?
  openchallengeid       int?      @unique
  openchallengeupdatedat datetime?
  points                int       @default(0)
}
```

### challenge model
The challenge model represents a daily challenge. A new model is created with each request to the `/api/admin/send-challenge` endpoint. Each challenge contains two general attribute types:
- Identifiers, the only of which being the id
- Challenge data such as the challenges title and description
- References to the challenges owner
```prisma
model challenge {
  id                int      @id @default(autoincrement())
  title             string
  description       string
  selectordescription string
  difficulty        string
  content           string
  tags              string[]
  points            int      @default(0)
  createdat         datetime @default(now())
  owner             user?
  ownerid           int?     @unique
  testcases         json?    @default("[]")
  generator         json?    @default("{}")
  functionname      string?
  help              string?
}
```

### message model
Each message model represents a message sent to a user. A new model is created with each request to the `/api/admin/send-message` endpoint. Each message contains two general attribute types:
- Identifiers, the only of which being the id
- Message data such as the message's icon, content, and banner color
- References to the message's owner
When created a message must be assigned to only one user, and is stored in the users inbox.
```prisma
model message {
  id          int    @id @default(autoincrement())
  icon        string @default("📢")
  content     string
  bannercolor string @default("#2821fc")
  owner       user   @relation(fields: [ownerid], references: [id])
  ownerid     int
}
```

---

## api documentation

### authentication
most endpoints require authentication via jwt cookies. see [authentication & authorization](#authentication--authorization) for details.

---

### public endpoints

#### health check
This endpoint is used by the redirect site to ensure the backend is running before redirecting the user.
```
get /ping
```
**response:**
```json
{
  "msg": "pong"
}
```

---

### authentication endpoints (`/auth`)

All auth endpoints use **http basic authentication** in the `authorization` header:
```
authorization: basic <base64(email:password)>
```
And all auth endpoints assign a jwt cookie to the response

#### sign up
```
post /auth/signup
```
**request:**
- basic auth: `email:password`
- email must be valid format
- password must be at least 6 characters

**response:**
- `201`: user created, jwt cookie set
- `400`: invalid input
- `409`: email already exists
- `500`: server error

**response body:**
```json
{
  "msg": "user created successfully"
}
```

#### login
```
post /auth/login
```
**request:**
- basic auth: `email:password` or `username:password`
- email domain must be: `gmail.com`, `yahoo.com`, or `proton.me`
- password must be at least 6 characters

**response:**
- `200`: login successful, jwt cookie set
- `400`: invalid input
- `401`: incorrect credentials
- `404`: user not found
- `500`: server error

**response body:**
```json
{
  "msg": "login successful"
}
```

---

### user endpoints (`/user`)

**all user endpoints require jwt authentication.** the jwt cookie is automatically sent by the browser, and is.

#### set name
```
post /user/set-name
```
**request body:**
```json
{
  "name": "john doe"
}
```

**response:**
- `200`: name updated
- `400`: invalid input
- `500`: server error

#### set username
```
post /user/set-username
```
**request body:**
```json
{
  "username": "johndoe123"
}
```
**validation:**
- 3+ characters
- alphanumeric and underscores only
- must be unique

**response:**
- `200`: username updated
- `400`: invalid input
- `409`: username taken
- `500`: server error

#### set preferences
```
post /user/set-pref
```
**request body:**
```json
{
  "topics": ["arrays", "strings", "algorithms"]
}
```

**response:**
- `200`: preferences updated
- `400`: invalid input
- `500`: server error

#### set language preference
```
post /user/set-pref-lang
```
**request body:**
```json
{
  "language": "javascript"
}
```
**supported languages:** `javascript`

**response:**
- `200`: language preference updated
- `400`: invalid language
- `500`: server error

#### get inbox
```
get /user/inbox
```
**response:**
```json
{
  "messages": [
    {
      "id": 1,
      "icon": "📢",
      "content": "welcome to skill bytes!",
      "bannercolor": "#2821fc",
      "ownerid": 1
    }
  ]
}
```

#### delete message
```
delete /user/msg:msgid
```
**response:**
- `200`: message deleted
- `400`: invalid message id
- `404`: message not found
- `500`: server error

#### get daily challenge
```
get /user/get-daily-challenge
```
**behavior:**
- returns the same challenge if already fetched today
- otherwise selects a new challenge based on user preferences
- excludes previously completed challenges

**response:**
```json
{
  "challenge": {
    "id": 1,
    "title": "reverse string",
    "description": "reverse a given string",
    "selectordescription": "reverse a string",
    "difficulty": "easy",
    "content": "write a function...",
    "tags": ["strings", "arrays"],
    "points": 10,
    "functionname": "reversestring",
    "testcases": [...],
    "generator": {...},
    "help": "hint text"
  }
}
```

#### get completed challenges
```
get /user/get-completed
```
**response:**
```json
{
  "challenges": [
    {
      "id": 1,
      "title": "reverse string",
      ...
    }
  ]
}
```

#### complete challenge
```
post /user/complete-challenge
```
**request body:**
```json
{
  "code": "function reversestring(str) { ... }",
  "challengeid": 1
}
```

**response:**
- `200`: challenge marked as completed, points awarded
- `400`: invalid input
- `403`: user not found
- `404`: challenge not found
- `500`: server error

#### get challenge completion status
```
get /user/challenge-completion-status
```
**response:**
```json
{
  "completedchallenges": [1, 2, 3]
}
```

#### get leaderboard
```
get /user/leader-board
```
**response:**
```json
{
  "leaderboard": [
    {
      "id": 1,
      "username": "johndoe",
      "points": 150
    }
  ],
  "id": 1  // current user id
}
```

---

### admin endpoints (`/admin`)

**all admin endpoints require http basic authentication with admin password.**

#### send message to all users
```
post /admin/send-msg
```
**request body:**
```json
{
  "content": "system maintenance scheduled",
  "icon": "⚠️",
  "bannercolor": "#ff0000"
}
```
**default values:**
- `icon`: `"📢"`
- `bannercolor`: `"#2821fc"`

**response:**
- `200`: message sent to all users
- `400`: invalid input
- `500`: server error

#### create challenge
```
post /admin/send-challenge
```
**request body:**
```json
{
  "title": "reverse string",
  "description": "reverse a given string",
  "selectordescription": "reverse a string",
  "difficulty": "easy",
  "tags": ["strings", "arrays"],
  "content": "write a function that reverses a string...",
  "functionname": "reversestring",
  "testcases": [...],
  "generator": {...},
  "help": "hint: use array methods",
  "points": 10
}
```

**response:**
- `200`: challenge created
- `400`: invalid input
- `500`: server error

---

## authentication & authorization

### user authentication

the application uses **jwt (json web tokens)** stored in http-only cookies for session management.

#### jwt token details
- **expiration**: 24 hours
- **cookie name**: `jwt`
- **cookie settings**:
  - `httponly`: true (prevents javascript access)
  - `secure`: true in production (https only)
  - `samesite`: `none` (allows cross-origin)
- **token payload**:
  ```json
  {
    "userid": 1,
    "email": "user@example.com"
  }
  ```

#### authentication flow

1. **sign up / login**:
   - user provides credentials via basic auth
   - server validates credentials
   - server generates jwt token
   - server sets jwt cookie in response
   - browser automatically includes cookie in subsequent requests

2. **protected endpoints**:
   - request includes jwt cookie
   - `authmiddleware` verifies token
   - if valid, extracts `userid` and attaches to `req.userid`
   - request proceeds to route handler

3. **token expiration**:
   - after 24 hours, token expires
   - user must log in again

### admin authentication

admin endpoints use **http basic authentication** with a password hash stored in environment variables.

#### admin middleware flow

1. request includes `authorization: basic <credentials>` header
2. middleware extracts password from basic auth
3. password is compared against `admin_passw_hash` (bcrypt)
4. if valid, request proceeds; otherwise returns `401`

#### generating admin password hash

use the provided script:
```bash
node server/scripts/gen-passw-hash.js <your-password>
```

the output is a base64-encoded hash that should be set as `admin_passw_hash` in your `.env` file.

---

## environment variables

create a `.env` file in the `server/` directory with the following variables:

### required variables

```env
# database - vars auto assigned in docker-compose.yaml
# database_url=postgresql://postgres:postgres@skill-bytes-db:5432/skill-bytes?schema=public

# server - vars auto assigned in docker-compose.yaml
# port=3000
# node_env=production  # or "development"

# authentication
jwt_secret=your-secret-key-here  # use a strong, random string

# admin
admin_passw_hash=base64-encoded-bcrypt-hash  # generate using gen-passw-hash.js
```

### environment variable details

- **database_url**: postgresql connection string (format: `postgresql://user:password@host:port/database?schema=public`)
- **port**: server port (default: 3000)
- **node_env**: environment mode (`production` or `development`)
- **jwt_secret**: secret key for signing jwt tokens (use a strong random string)
- **admin_passw_hash**: base64-encoded bcrypt hash of admin password

### generating secrets

**jwt secret:**
```bash
# linux/mac
openssl rand -base64 32

# powershell (windows)
[convert]::tobase64string((1..32 | foreach-object { get-random -minimum 0 -maximum 256 }))
```

**admin password hash:**
```bash
node server/scripts/gen-passw-hash.js your-admin-password
```

---

## development setup

### prerequisites

- **docker** and **docker compose** installed
- **node.js 22+** (for local development, optional)
- **git**

### quick start

1. **clone the repository**
   ```bash
   git clone <repository-url>
   cd skill-bytes-backend
   ```

2. **create environment file**
   ```bash
   cd server
   cp .env.example .env  # or create .env manually
   # edit .env with your configuration
   cd ..
   ```

3. **start server**
    - Go to [COMPOSE.md](/docs/development/COMPOSE.md) for details on developement hosting
    - Go to [SWARM.md](/docs/development/SWARM.md) for details on production hosting

4. **verify setup**
   ```bash
   curl http://localhost:3000/ping
   # should return: {"msg":"pong"}
   ```

### development workflow

- **database migrations**: run migrations inside the container:
  ```bash
  docker compose exec server npx prisma migrate dev --name migration-name
  ```
- **view compose logs**: you can view logs from each service:
    ```bash
    docker logs <SERVICE_NAME>
    ```
- **view logs**: logs are written to `server/logs/` in development mode
- **stopping the service**:
    ```bash
    docker compose down
    ```
- **removing volumes** (clears database):
    ```bash
    docker compose down -v
    ```

---

### production considerations

- **security**: ensure `jwt_secret` and `admin_passw_hash` are strong and kept secret
- **database backups**: implement regular postgresql backups
- **logging**: in production, logs go to console (stdout/stderr) for container log aggregation
- **monitoring**: monitor the tmux session and docker containers regularly
- **updates**: pull latest changes and restart the tmux session for updates
- **tmole stability**: the watcher script automatically restarts tmole if it crashes

### production directory structure

```
~/
├── skill-bytes-backend/     # this repository
├── skill-bytes-redirect/    # redirect service (auto-updated)
└── skill-bytes-frontend/    # frontend repo (auto-updated)
```

---

## scripts & utilities

### password hash generator

**location**: `server/scripts/gen-passw-hash.js`

generates a bcrypt hash for admin passwords.

**usage:**
```bash
node server/scripts/gen-passw-hash.js <password>
```

**output**: base64-encoded hash (set as `admin_passw_hash`)

### clear logs script

**location**: `server/scripts/clear-logs.ps1`

powershell script to clear log files (windows).

---

## logging

the application uses **winston** for structured logging.

### log levels
- **info**: general information
- **error**: error conditions

### log output

**development mode:**
- console output
- file output:
  - `server/logs/info.log`: info-level logs
  - `server/logs/error.log`: error-level logs

**production mode:**
- console output only (stdout/stderr)
- logs are captured by docker and can be aggregated by log management tools

### log format

logs are in json format with timestamp:
```json
{
  "level": "error",
  "message": "error in login",
  "timestamp": "2024-01-01t12:00:00.000z",
  "error": {...},
  "stack": "..."
}
```

### accessing logs

**development:**
```bash
# view info logs
tail -f server/logs/info.log

# view error logs
tail -f server/logs/error.log
```

**production (docker):**
```bash
# view server logs
docker compose logs -f server

# view database logs
docker compose logs -f skill-bytes-db
```

---

## related repositories

### skill-bytes-frontend
frontend react application served statically from this backend's `/public/dist` directory.

**note**: in production, the frontend is typically deployed separately to netlify, but static assets can also be served from this backend.

### skill-bytes-redirect
redirect service that provides the current backend url to the frontend. updated automatically by `tmole_watcher.sh` in production.

---

## contributing

please refer to the following documentation files:

- **[contributing.md](docs/contributing/contributing.md)**: contribution guidelines
- **[cla.md](docs/licensing/cla.md)**: contributor license agreement
- **[agile.md](docs/contributing/agile.md)**: agile development practices
- **[license.md](docs/licensing/license.md)**: license information

### quick contribution checklist

1. read `contributing.md`
2. create a feature branch
3. make your changes
4. test locally with `./boot.sh`
5. update documentation if needed
6. submit a pull request

---

## troubleshooting

### common issues

**database connection errors**
- verify `database_url` in `.env`
- ensure database container is running: `docker compose ps`
- check database logs: `docker compose logs skill-bytes-db`

**jwt authentication failing**
- verify `jwt_secret` is set in `.env`
- check cookie settings match your domain
- ensure cookies are being sent (check browser devtools)

**admin endpoints returning 401**
- verify `admin_passw_hash` is correctly set (base64-encoded)
- regenerate hash using `gen-passw-hash.js`
- check basic auth header format

**prisma migration errors**
- reset database: `docker compose down -v` then rebuild
- check migration files in `server/prisma/migrations/`
- verify database schema matches prisma schema

**port already in use**
- change `port` in `.env` or `docker-compose.yaml`
- or stop the process using port 3000

**tmole not working in production**
- verify tmole is installed: `which tmole`
- check tmux pane 1 for error messages
- restart the tmux session

---

## license

see [license.md](docs/licensing/license.md) for license information.

---

## support

for issues, questions, or contributions, please refer to the [contributing guidelines](docs/contributing/contributing.md) or open an issue in the repository.

---

**last updated**: 2024
