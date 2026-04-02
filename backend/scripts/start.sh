#!/bin/bash
set -e

echo "Running Prisma migrations..."
npx prisma db push --skip-generate

echo "Starting server..."
exec node node_modules/tsx/dist/cli.mjs src/server.ts
