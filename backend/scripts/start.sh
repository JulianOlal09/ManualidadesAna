#!/bin/bash
set -e

echo "Running Prisma migrations..."
node node_modules/prisma/build/index.js db push --skip-generate

echo "Starting server..."
exec node --import tsx src/server.ts
