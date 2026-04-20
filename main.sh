#!/bin/bash

echo "0 - Instalar dependências e executar o projeto"
echo "1 - Instalar dependências"
echo "2 - Executar o projeto"
read option

case $option in
  0)
    bash ./create
    bash ./run
    ;;
  1)
    bash ./create
    ;;
  2)
    bash ./run
    ;;
  *)
    exit 1
    ;;
esac