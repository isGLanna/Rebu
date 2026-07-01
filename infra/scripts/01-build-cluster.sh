#! /bin/bash

cd ..
docker build -t rebu-backend:v1 -f compose/Dockerfile ..

docker pull prom/prometheus:v2.54.0
docker pull grafana/grafana-enterprise:13.1.0

# Cria o plano de controle responsável por gerenciar o cluster e os nós de trabalho
kind create cluster --name rebu-cluster --config k8s/config.yaml

kind load docker-image rebu-backend:v1 --name rebu-cluster
kind load docker-image prom/prometheus:v2.54.0 --name rebu-cluster
kind load docker-image grafana/grafana-enterprise:13.1.0 --name rebu-cluster

kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/auto-scaler.yaml

# Gera a imagem do back
# Cria o cluster e passa as configurações para o kubectl
# Carrega a imagem do backend para o cluster
# Aplica as configurações de ingress e auto-scaler no cluster