#!/bin/sh
set -e

echo "Running migrations"
npx prisma migrate deploy

echo "Generating prisma client"
npx prisma generate

echo "Starting service"
exec "$@"
