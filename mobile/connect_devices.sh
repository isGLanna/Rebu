#! /bin/bash
# Script para conectar aos dispositivos usando adb via wifi
# dar espaçamento de linha para entrada do códigos com \n do bash

read -p $'Caso seu IP esteja configurado aqui, apenas insira a porta virtual do dispositivo:\n' PORT
read -p $'Insira o código de emparelhamento:\n' CODE
read -p $'Insira a porta real do dispositivo:\n' REAL_PORT

adb pair 192.168.3.10:$PORT --pairing-code $CODE
adb connect 192.168.3.10:$REAL_PORT