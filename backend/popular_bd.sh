#!/bin/bash

BASE_URL="http://localhost:3001/usuarios"
TOTAL_USUARIOS=10

for ((i=1; i<=TOTAL_USUARIOS; i++)); do
    EMAIL="teste${i}@teste.com"

    echo "=============================="
    echo "Criando $EMAIL"

    curl -s -X POST "$BASE_URL" \
        -H "Content-Type: application/json" \
        -d "{
            \"nome\": \"Motorista Teste $i\",
            \"email\": \"$EMAIL\",
            \"senha\": \"1234\",
            \"tipo\": \"motorista\"
        }"

    echo
    echo "Realizando login de $EMAIL"

    curl -s -X POST "$BASE_URL/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$EMAIL\",
            \"senha\": \"1234\"
        }"

    echo
    echo "=============================="
    echo
done