#!/bin/bash

cd ./backend
docker compose up --no-start
cd ../mobile
npm install
cd ..