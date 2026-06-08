#!/bin/sh
set -e

echo "Running DB init..."

pnpm db:push
pnpm db:generate

echo "Starting app..."

exec "$@"