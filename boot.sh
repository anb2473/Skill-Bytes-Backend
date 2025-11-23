#!/bin/bash
docker compose build
docker compose run server npx prisma migrate dev --name init
docker compose up
