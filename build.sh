#!/bin/sh
echo Building node environment

docker build -t oqs-client:build . -f Dockerfile-production.build

docker create --name extract oqs-client:build
mkdir public
docker cp extract:/opt/mean.js/public ./public
docker rm -f extract

echo Building nginx environment

docker build --no-cache -t oqs-client:latest . -f Dockerfile-production
rm -rf public
