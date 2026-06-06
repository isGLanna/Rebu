#!/bin/bash

docker build -f infra/compose/Dockerfile -t rebu-backend:v1 .
docker login
docker push rebu-backend:v1            # <<<--- alterar o .env

kind create cluster --name rebu-cluster
kind load docker-image rebu-backend --name rebu-cluster
# Constroi e envia a imagem Docker para o Docker Hub.
# Essa operação disponibiliza a imagem para ser utilizada pelo Kubernetes, que irá criar os pods do cluster.