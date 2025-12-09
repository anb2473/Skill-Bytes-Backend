# Skill Bytes Backend

The Skill Bytes Backend service is the core server framework for the Skill Bytes educational platform. Skill Bytes is designed to help developers learn new programming concepts and maintain their programming abilities through daily coding challenges, preventing skill decay due to AI dependency.

**Live Application:** [skill-bytes.netlify.app](https://skill-bytes.netlify.app)

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

- **User Authentication**: Secure login/signup with JWT-based session management
- **Challenge Management**: Daily coding challenges with personalized recommendations
- **User Profiles**: User preferences, progress tracking, and leaderboard
- **Messaging System**: Admin-to-user messaging system
- **Admin Tools**: Challenge creation and system management endpoints

The backend is fully containerized using Docker and Docker Compose, with PostgreSQL as the database and Prisma as the ORM.

---

## Architecture

The backend follows a modular Express.js architecture:

```text
server/
├── server.js              # Main application entry point
├── routes/                # Route handlers
│   ├── auth/             # Authentication endpoints
│   ├── user/             # User-protected endpoints
│   └── admin/            # Admin-protected endpoints
├── middleware/           # Express middleware
│   ├── authMiddleware.js    # JWT authentication
│   └── adminMiddleware.js   # Admin password verification
├── prisma/               # Database schema and migrations
├── scripts/              # Utility scripts
├── public/               # Static frontend assets
└── logs/                 # Application logs
```

### Service Architecture

The application runs two Docker containers:

1. **Node.js/Express Server** (`skill-bytes-server`)
   - Handles all HTTP requests
   - Serves static frontend assets
   - Manages API routes and middleware

2. **PostgreSQL Database** (`skill-bytes-db`)
   - Stores all application data
   - Managed via Prisma ORM
   - Persistent data volume

---

## Technology Stack

### Core Technologies
- **Runtime**: Node.js 22 (Alpine Linux)
- **Framework**: Express.js 5.1.0
- **Database**: PostgreSQL 13 (Alpine)
- **ORM**: Prisma 6.19.0
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Logging**: Winston
- **Validation**: validator.js

### Key Dependencies
- `express`: Web framework
- `@prisma/client`: Database client
- `jsonwebtoken`: JWT token generation/verification
- `bcryptjs`: Password hashing
- `cookie-parser`: Cookie parsing middleware
- `cors`: Cross-origin resource sharing
- `winston`: Logging framework
- `validator`: Input validation

---

## Database Schema

The application uses Prisma ORM with the following models:

### User Model
```prisma
model User {
  id                    Int       @id @default(autoincrement())
  email                 String    @unique
  passw                 String                    // Hashed password
  username              String?   @unique
  fname                 String?                   // First name
  createdAt             DateTime  @default(now())
  inbox                 Message[]
  preferences           String[]  @default([])     // Topic preferences
  languages             String    @default("JavaScript")
  previouslyCompleted   Int[]     @default([])    // Challenge IDs
  completedChallenges   Int[]     @default([])    // Completed challenge IDs
  openChallenge         Challenge?
  openChallengeId       Int?      @unique
  openChallengeUpdatedAt DateTime?
  points                Int       @default(0)
}
```

### Challenge Model
```prisma
model Challenge {
  id                Int      @id @default(autoincrement())
  title             String
  description       String
  selectorDescription String
  difficulty        String
  content           String
  tags              String[]
  points            Int      @default(0)
  createdAt         DateTime @default(now())
  owner             User?
  ownerid           Int?     @unique
  testCases         Json?    @default("[]")
  generator         Json?    @default("{}")
  functionName      String?
  help              String?
}
```

### Message Model
```prisma
model Message {
  id          Int    @id @default(autoincrement())
  icon        String @default("📢")
  content     String
  bannerColor String @default("#2821fc")
  owner       User   @relation(fields: [ownerid], references: [id])
  ownerid     Int
}
```

---

## API Documentation

### Base URL
- **Development**: `http://localhost:3000`
- **Production**: Configured via environment

### Authentication
Most endpoints require authentication via JWT cookies. See [Authentication & Authorization](#authentication--authorization) for details.

---

### Public Endpoints

#### Health Check
```
GET /ping
```
**Response:**
```json
{
  "msg": "pong"
}
```

---

### Authentication Endpoints (`/auth`)

All auth endpoints use **HTTP Basic Authentication** in the `Authorization` header:
```
Authorization: Basic <base64(email:password)>
```

#### Sign Up
```
POST /auth/signup
```
**Request:**
- Basic Auth: `email:password`
- Email must be valid format
- Password must be at least 6 characters

**Response:**
- `201`: User created, JWT cookie set
- `400`: Invalid input
- `409`: Email already exists
- `500`: Server error

**Response Body:**
```json
{
  "message": "User created successfully"
}
```

#### Login
```
POST /auth/login
```
**Request:**
- Basic Auth: `email:password` or `username:password`
- Email domain must be: `gmail.com`, `yahoo.com`, or `proton.me`
- Password must be at least 6 characters

**Response:**
- `200`: Login successful, JWT cookie set
- `400`: Invalid input
- `401`: Incorrect credentials
- `404`: User not found
- `500`: Server error

**Response Body:**
```json
{
  "message": "Login successful"
}
```

---

### User Endpoints (`/user`)

**All user endpoints require JWT authentication.** The JWT cookie is automatically sent by the browser.

#### Set Name
```
POST /user/set-name
```
**Request Body:**
```json
{
  "name": "John Doe"
}
```

**Response:**
- `200`: Name updated
- `400`: Invalid input
- `500`: Server error

#### Set Username
```
POST /user/set-username
```
**Request Body:**
```json
{
  "username": "johndoe123"
}
```
**Validation:**
- 3+ characters
- Alphanumeric and underscores only
- Must be unique

**Response:**
- `200`: Username updated
- `400`: Invalid input
- `409`: Username taken
- `500`: Server error

#### Set Preferences
```
POST /user/set-pref
```
**Request Body:**
```json
{
  "topics": ["arrays", "strings", "algorithms"]
}
```

**Response:**
- `200`: Preferences updated
- `400`: Invalid input
- `500`: Server error

#### Set Language Preference
```
POST /user/set-pref-lang
```
**Request Body:**
```json
{
  "language": "javascript"
}
```
**Supported Languages:** `javascript`

**Response:**
- `200`: Language preference updated
- `400`: Invalid language
- `500`: Server error

#### Get Inbox
```
GET /user/inbox
```
**Response:**
```json
{
  "messages": [
    {
      "id": 1,
      "icon": "📢",
      "content": "Welcome to Skill Bytes!",
      "bannerColor": "#2821fc",
      "ownerid": 1
    }
  ]
}
```

#### Delete Message
```
DELETE /user/msg:msgId
```
**Response:**
- `200`: Message deleted
- `400`: Invalid message ID
- `404`: Message not found
- `500`: Server error

#### Get Daily Challenge
```
GET /user/get-daily-challenge
```
**Behavior:**
- Returns the same challenge if already fetched today
- Otherwise selects a new challenge based on user preferences
- Excludes previously completed challenges

**Response:**
```json
{
  "challenge": {
    "id": 1,
    "title": "Reverse String",
    "description": "Reverse a given string",
    "selectorDescription": "Reverse a string",
    "difficulty": "easy",
    "content": "Write a function...",
    "tags": ["strings", "arrays"],
    "points": 10,
    "functionName": "reverseString",
    "testCases": [...],
    "generator": {...},
    "help": "Hint text"
  }
}
```

#### Get Completed Challenges
```
GET /user/get-completed
```
**Response:**
```json
{
  "challenges": [
    {
      "id": 1,
      "title": "Reverse String",
      ...
    }
  ]
}
```

#### Complete Challenge
```
POST /user/complete-challenge
```
**Request Body:**
```json
{
  "code": "function reverseString(str) { ... }",
  "challengeId": 1
}
```

**Response:**
- `200`: Challenge marked as completed, points awarded
- `400`: Invalid input
- `403`: User not found
- `404`: Challenge not found
- `500`: Server error

#### Get Challenge Completion Status
```
GET /user/challenge-completion-status
```
**Response:**
```json
{
  "completedChallenges": [1, 2, 3]
}
```

#### Get Leaderboard
```
GET /user/leader-board
```
**Response:**
```json
{
  "leaderboard": [
    {
      "id": 1,
      "username": "johndoe",
      "points": 150
    }
  ],
  "id": 1  // Current user ID
}
```

---

### Admin Endpoints (`/admin`)

**All admin endpoints require HTTP Basic Authentication with admin password.**

#### Send Message to All Users
```
POST /admin/send-msg
```
**Request Body:**
```json
{
  "content": "System maintenance scheduled",
  "icon": "⚠️",
  "bannerColor": "#ff0000"
}
```
**Default Values:**
- `icon`: `"📢"`
- `bannerColor`: `"#2821fc"`

**Response:**
- `200`: Message sent to all users
- `400`: Invalid input
- `500`: Server error

#### Create Challenge
```
POST /admin/send-challenge
```
**Request Body:**
```json
{
  "title": "Reverse String",
  "description": "Reverse a given string",
  "selectorDescription": "Reverse a string",
  "difficulty": "easy",
  "tags": ["strings", "arrays"],
  "content": "Write a function that reverses a string...",
  "functionName": "reverseString",
  "testCases": [...],
  "generator": {...},
  "help": "Hint: Use array methods",
  "points": 10
}
```

**Response:**
- `200`: Challenge created
- `400`: Invalid input
- `500`: Server error

---

## Authentication & Authorization

### User Authentication

The application uses **JWT (JSON Web Tokens)** stored in HTTP-only cookies for session management.

#### JWT Token Details
- **Expiration**: 24 hours
- **Cookie Name**: `jwt`
- **Cookie Settings**:
  - `httpOnly`: true (prevents JavaScript access)
  - `secure`: true in production (HTTPS only)
  - `sameSite`: `none` (allows cross-origin)
- **Token Payload**:
  ```json
  {
    "userId": 1,
    "email": "user@example.com"
  }
  ```

#### Authentication Flow

1. **Sign Up / Login**:
   - User provides credentials via Basic Auth
   - Server validates credentials
   - Server generates JWT token
   - Server sets JWT cookie in response
   - Browser automatically includes cookie in subsequent requests

2. **Protected Endpoints**:
   - Request includes JWT cookie
   - `authMiddleware` verifies token
   - If valid, extracts `userId` and attaches to `req.userID`
   - Request proceeds to route handler

3. **Token Expiration**:
   - After 24 hours, token expires
   - User must log in again

### Admin Authentication

Admin endpoints use **HTTP Basic Authentication** with a password hash stored in environment variables.

#### Admin Middleware Flow

1. Request includes `Authorization: Basic <credentials>` header
2. Middleware extracts password from Basic Auth
3. Password is compared against `ADMIN_PASSW_HASH` (bcrypt)
4. If valid, request proceeds; otherwise returns `401`

#### Generating Admin Password Hash

Use the provided script:
```bash
node server/scripts/gen-passw-hash.js <your-password>
```

The output is a base64-encoded hash that should be set as `ADMIN_PASSW_HASH` in your `.env` file.

---

## Environment Variables

Create a `.env` file in the `server/` directory with the following variables:

### Required Variables

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@skill-bytes-db:5432/skill-bytes?schema=public

# Server
PORT=3000
NODE_ENV=production  # or "development"

# Authentication
JWT_SECRET=your-secret-key-here  # Use a strong, random string

# Admin
ADMIN_PASSW_HASH=base64-encoded-bcrypt-hash  # Generate using gen-passw-hash.js
```

### Environment Variable Details

- **DATABASE_URL**: PostgreSQL connection string (format: `postgresql://user:password@host:port/database?schema=public`)
- **PORT**: Server port (default: 3000)
- **NODE_ENV**: Environment mode (`production` or `development`)
- **JWT_SECRET**: Secret key for signing JWT tokens (use a strong random string)
- **ADMIN_PASSW_HASH**: Base64-encoded bcrypt hash of admin password

### Generating Secrets

**JWT Secret:**
```bash
# Linux/Mac
openssl rand -base64 32

# PowerShell (Windows)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Admin Password Hash:**
```bash
node server/scripts/gen-passw-hash.js your-admin-password
```

---

## Development Setup

### Prerequisites

- **Docker** and **Docker Compose** installed
- **Node.js 22+** (for local development, optional)
- **Git**

### Step-by-Step Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd Skill-Bytes-Backend
   ```

2. **Create Environment File**
   ```bash
   cd server
   cp .env.example .env  # Or create .env manually
   # Edit .env with your configuration
   cd ..
   ```

3. **Build Docker Images**
   ```bash
   docker compose build
   ```

4. **Initialize Database**
   ```bash
   docker compose run server npx prisma migrate dev --name init
   ```
   This creates the database schema and runs all migrations.

5. **Start Services**
   ```bash
   docker compose up
   ```

   The server will be available at `http://localhost:3000`

6. **Verify Setup**
   ```bash
   curl http://localhost:3000/ping
   # Should return: {"msg":"pong"}
   ```

### Development Workflow

- **Hot Reload**: The server directory is mounted as a volume, so code changes are reflected immediately
- **Database Migrations**: Run migrations inside the container:
  ```bash
  docker compose exec server npx prisma migrate dev --name migration-name
  ```
- **Prisma Studio**: Access database GUI:
  ```bash
  docker compose exec server npx prisma studio
  ```
- **View Logs**: Logs are written to `server/logs/` in development mode

### Stopping Services

```bash
docker compose down
```

To remove volumes (clears database):
```bash
docker compose down -v
```

---

## Production Deployment

The production deployment uses a self-hosting solution with Docker, tmux, and tmole (tunneling service).

### Prerequisites

- **Linux server** with Docker installed
- **tmux** installed
- **tmole** installed
- Clones of `skill-bytes-redirect` and `skill-bytes-frontend` repositories at `~/Skill-Bytes-Redirect` and `~/Skill-Bytes-Frontend`

### Production Setup

1. **Clone and Configure**
   ```bash
   git clone <repository-url> ~/Skill-Bytes-Backend
   cd ~/Skill-Bytes-Backend/server
   # Create .env with production values
   ```

2. **Build and Start**
   ```bash
   cd ~/Skill-Bytes-Backend
   docker compose build
   docker compose run server npx prisma migrate deploy
   ```

3. **Run Init Script**
   ```bash
   chmod +x tmux_init.sh
   ./tmux_init.sh
   ```

### Production Scripts

#### `tmux_init.sh`

Creates a tmux session with three panes:
- **Pane 0**: Docker Compose services
- **Pane 1**: Reserved for tmole watcher
- **Pane 2**: tmole watcher script

#### `tmole_watcher.sh`

Monitors pane 1 for tmole process:
- If tmole is not running, starts it
- Extracts the tunnel URL from tmole output
- Updates `skill-bytes-redirect/redirect.json` with new URL
- Updates `skill-bytes-frontend/src/pages/config.jsx` with new URL
- Commits and pushes changes to respective repositories

**Note**: This script requires:
- Git repositories configured with push access
- Proper file permissions
- Network access to GitHub/GitLab

### Production Considerations

- **Security**: Ensure `JWT_SECRET` and `ADMIN_PASSW_HASH` are strong and kept secret
- **Database Backups**: Implement regular PostgreSQL backups
- **Logging**: In production, logs go to console (stdout/stderr) for container log aggregation
- **SSL/TLS**: Use a reverse proxy (nginx, Caddy) for HTTPS termination
- **Monitoring**: Set up monitoring and alerting for the Docker containers
- **Updates**: Use `docker compose pull` and `docker compose up -d` for updates

---

## Scripts & Utilities

### Password Hash Generator

**Location**: `server/scripts/gen-passw-hash.js`

Generates a bcrypt hash for admin passwords.

**Usage:**
```bash
node server/scripts/gen-passw-hash.js <password>
```

**Output**: Base64-encoded hash (set as `ADMIN_PASSW_HASH`)

### Send Challenge Script

**Location**: `server/scripts/send-challenge.js`

Utility script for creating challenges (if implemented).

### Send Message Script

**Location**: `server/scripts/send-msg.js`

Utility script for sending messages (if implemented).

### Clear Logs Script

**Location**: `server/scripts/clear-logs.ps1`

PowerShell script to clear log files (Windows).

---

## Logging

The application uses **Winston** for structured logging.

### Log Levels
- **info**: General information
- **error**: Error conditions

### Log Output

**Development Mode:**
- Console output
- File output:
  - `server/logs/info.log`: Info-level logs
  - `server/logs/error.log`: Error-level logs

**Production Mode:**
- Console output only (stdout/stderr)
- Logs are captured by Docker and can be aggregated by log management tools

### Log Format

Logs are in JSON format with timestamp:
```json
{
  "level": "error",
  "message": "Error in login",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "error": {...},
  "stack": "..."
}
```

### Accessing Logs

**Development:**
```bash
# View info logs
tail -f server/logs/info.log

# View error logs
tail -f server/logs/error.log
```

**Production (Docker):**
```bash
# View server logs
docker compose logs -f server

# View database logs
docker compose logs -f skill-bytes-db
```

---

## Related Repositories

### skill-bytes-frontend
Frontend React application served statically from this backend's `/public/dist` directory.

**Note**: In production, the frontend is typically deployed separately to Netlify, but static assets can also be served from this backend.

### skill-bytes-redirect
Redirect service that provides the current backend URL to the frontend. Updated automatically by `tmole_watcher.sh` in production.

---

## Contributing

Please refer to the following documentation files:

- **[CONTRIBUTING.md](docs/CONTRIBUTING.md)**: Contribution guidelines
- **[CLA.md](docs/CLA.md)**: Contributor License Agreement
- **[AGILE.md](docs/AGILE.md)**: Agile development practices
- **[LICENSE.md](docs/LICENSE.md)**: License information

### Quick Contribution Checklist

1. Read `CONTRIBUTING.md`
2. Create a feature branch
3. Make your changes
4. Test locally with Docker
5. Update documentation if needed
6. Submit a pull request

---

## Troubleshooting

### Common Issues

**Database Connection Errors**
- Verify `DATABASE_URL` in `.env`
- Ensure database container is running: `docker compose ps`
- Check database logs: `docker compose logs skill-bytes-db`

**JWT Authentication Failing**
- Verify `JWT_SECRET` is set in `.env`
- Check cookie settings match your domain
- Ensure cookies are being sent (check browser DevTools)

**Admin Endpoints Returning 401**
- Verify `ADMIN_PASSW_HASH` is correctly set (base64-encoded)
- Regenerate hash using `gen-passw-hash.js`
- Check Basic Auth header format

**Prisma Migration Errors**
- Reset database: `docker compose down -v` then rebuild
- Check migration files in `server/prisma/migrations/`
- Verify database schema matches Prisma schema

**Port Already in Use**
- Change `PORT` in `.env` or `docker-compose.yaml`
- Or stop the process using port 3000

---

## License

See [LICENSE.md](docs/LICENSE.md) for license information.

---

## Support

For issues, questions, or contributions, please refer to the [Contributing Guidelines](docs/CONTRIBUTING.md) or open an issue in the repository.

---

**Last Updated**: 2024
