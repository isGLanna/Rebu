#!/bin/bash

echo "Iniciando backend..."
cd backend
docker compose up -d

echo "Iniciando frontend..."
cd ../mobile
docker compose up -d
PID_FRONTEND=$!

kill_process() {
  cd ../backend

  docker compose down
  kill $PID_FRONTEND 2>/dev/null
  wait $PID_FRONTEND 2>/dev/null

  exit 0
}

trap kill_process INT TERM EXIT
wait