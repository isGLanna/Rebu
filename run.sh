#!/bin/bash

echo "Iniciando backend..."
cd backend
docker compose up -d

echo "Iniciando frontend..."
cd ../mobile
npx expo run:android &  # Inicia o aplicativo para android, para executar no ios, altere o Dockerfile em CMD... run:android para :ios
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