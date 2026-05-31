#!/bin/bash

cd ./backend
docker compose up --no-start
cd ../mobile
docker compose up --no-start
cd ..

# Apenas prepara os containers