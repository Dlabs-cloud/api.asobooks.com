#!bin/bash
docker pull uncletee/asobooks-api
docker-compose down
docker system prune -f
docker-compose up
