#! /bin/bash

cd ../k8s

# Aplica as configurações do ingress-nginx para permitir expor o cluster
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
kubectl wait --for=condition=ready pod \
  --selector=app=rebu-backend \
  --timeout=30s
# Extrai script de inicialização do banco de dados e cria o configmap para o Postgres acessar o sql
# Obs: caso já exista, deleta para garantir atualizações automáticas da estrutura sql
kubectl delete configmap db-init-script --ignore-not-found
kubectl delete pvc postgres-pvc --ignore-not-found
kubectl create configmap db-init-script --from-file=init.sql=../../backend/sql/init.sql

kubectl apply -f postgres/pvc.yaml
kubectl apply -f redis/pvc.yaml

kubectl apply -f postgres/deployment.yaml
kubectl apply -f redis/deployment.yaml

kubectl apply -f postgres/service.yaml
kubectl apply -f redis/service.yaml
