#!/bin/sh
set -e

echo "📁 Ensuring data directories exist..."
mkdir -p /app/prisma/data /app/uploads

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "🚀 Starting Prompt Professor API..."
# exec ersetzt den Shell-Prozess → SIGTERM wird korrekt an Node weitergeleitet
exec node dist/index.js
