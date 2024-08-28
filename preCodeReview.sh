#!/bin/bash
export COMPOSE_PROJECT_NAME="oqs_client_tests"

# Begin Docker procedure
time docker-compose down --volumes
if [[ $? -ne 0 ]]
then
    echo ok
fi
time docker-compose build
if [[ $? -ne 0 ]]
then
    exit 1
fi
#lint test the client
time docker-compose run --rm client tests/styles.sh --force-recreate
if [[ $? -ne 0 ]]
then
    exit 1
fi

time docker-compose down --volumes
