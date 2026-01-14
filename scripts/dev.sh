#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SERVICE_NAME="chatapp-mongo"

command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed."; exit 1; }

if ! docker compose ps -q "${SERVICE_NAME}" >/dev/null 2>&1; then
  echo "Starting Docker services..."
  docker compose up -d
fi

STATUS="$(docker inspect --format '{{.State.Health.Status}}' "${SERVICE_NAME}" 2>/dev/null || echo "starting")"
until [ "$STATUS" = "healthy" ]; do
  echo "Waiting for MongoDB to be healthy (current: $STATUS)..."
  sleep 3
  STATUS="$(docker inspect --format '{{.State.Health.Status}}' "${SERVICE_NAME}" 2>/dev/null || echo "starting")"
  if [ "$STATUS" = "unhealthy" ]; then
    echo "MongoDB container is unhealthy. Check docker logs ${SERVICE_NAME}."; exit 1
  fi
  if [ "$STATUS" = "" ]; then
    docker compose up -d
    STATUS="starting"
  fi
done

echo "MongoDB is healthy. Starting client and server..."
cd "$ROOT_DIR"
npx concurrently "npm --prefix server run dev" "npm --prefix client run dev"
