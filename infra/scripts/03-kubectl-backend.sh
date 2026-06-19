#! /bin/bash

cd ../k8s

kubectl apply -f backend/deployment.yaml
kubectl apply -f backend/service.yaml

curl -X GET http://localhost:80/health
# Se retornar é porque deu bom