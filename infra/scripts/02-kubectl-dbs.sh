#! /bin/bash

cd ../k8s

# Extrai script de inicialização do banco de dados e cria o configmap para o Postgres acessar
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
