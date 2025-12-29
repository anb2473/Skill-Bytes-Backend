# Docker Compose Deployment Guide

This document provides instructions for deploying this application on any OS using Docker Compose. **This guide is intended for development deployment only.**

For production deployment information, please refer to [SWARM.md](SWARM.md).

## Prerequisites

Before proceeding with deployment, ensure the following requirements are met:

1. A computer with any Docker-compatible OS
2. Docker and Docker Compose installed
3. This repository cloned onto your local machine

## Setup Guide

### 1. Build Images

Build the Docker images by running:
```bash
docker compose build
```

### 2. Migrate Prisma Database

Initialize the database schema using Prisma (the ORM that bridges PostgreSQL and our Node.js service):
```bash
docker compose run skill-bytes-server npx prisma migrate dev --name init
```

### 3. Deploy Services

Start all services in detached mode:
```bash
docker compose up -d
```

## Accessing the Development Environment

Once the services are running, retrieve the public URL by viewing the cloudflared logs:
```bash
docker logs cloudflared
```

The logs will display a URL similar to `https://some-url.trycloudflare.com`. This is your publicly accessible application URL.

**Local Access:** You can also access the application at `http://127.0.0.1:3000`. However, testing via the cloudflared tunnel is recommended as it more closely represents the production environment.

## Redeployment

### For Code-Only Changes

If you've only modified the codebase (no changes to `docker-compose.yaml` or dependencies):

1. Rebuild the images:
```bash
   docker compose build
```

2. Restart the services:
```bash
   docker compose up -d
```

### For Configuration or Dependency Changes

If your changes include modifications to `docker-compose.yaml`, Dockerfile, or dependencies, perform a full redeployment:

1. Stop and remove all containers:
```bash
   docker compose down
```

2. Follow the complete setup process again starting from Step 1 (Build Images).

## Database Management

### Resetting the Database

To completely reset the database (delete all data and recreate from scratch):

1. Stop services and remove all volumes:
```bash
   docker compose down -v
```

2. Follow the complete setup process again starting from Step 1 (Build Images).

**⚠️ WARNING:** The `-v` flag deletes all database data. **NEVER run this command in the production environment.**

## Stopping Services

Lastly, to stop all services, simply use the command:
```bash
docker compose stop
```

To restart the stopped services:
```bash
docker compose start
```
