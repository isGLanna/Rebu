#! /bin/bash

cd ../k8s

# Após inicializar o serviço do backend, aplica as configurações da instância de observabilidade
kubectl apply -f observability/prometheus/configmap.yaml

kubectl apply -f observability/prometheus/pvc.yaml
kubectl apply -f observability/grafana/pvc.yaml


kubectl apply -f observability/prometheus/deployment.yaml
kubectl apply -f observability/grafana/deployment.yaml

kubectl apply -f observability/prometheus/service.yaml
kubectl apply -f observability/grafana/service.yaml