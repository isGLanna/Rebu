#!/bin/bash

docker build -f infra/compose/Dockerfile -t rebu:v1 .
docker login
docker tag rebu:v1 giordanolanna/rebu:v1
docker push giordanolanna/rebu:v1