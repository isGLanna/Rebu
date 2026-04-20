echo "Iniciando backend..."
npm run dev &
PID_BACKEND=$!

echo "Iniciando frontend..."
cd ../mobile
npx expo start &
PID_FRONTEND=$!

kill_process() {
  kill $PID_BACKEND 2>/dev/null
  kill $PID_FRONTEND 2>/dev/null

  wait $PID_BACKEND 2>/dev/null
  wait $PID_FRONTEND 2>/dev/null

  exit 0
}

trap kill_process INT TERM EXIT
wait