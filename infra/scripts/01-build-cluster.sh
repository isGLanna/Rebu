#! /bin/bash

cd ..
docker build -t rebu-backend:v1 -f compose/Dockerfile

kind create cluster --name rebu-cluster --config k8s/config.yaml
kind load docker-image rebu-backend:v1 --name rebu-cluster

kind apply -f k8s/ingress.yaml
kind apply -f k8s/auto-scaler.yaml
