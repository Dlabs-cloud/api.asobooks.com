FROM node:14.10.1-alpine3.12

WORKDIR /app

COPY .docker/node_modules ./node_modules
COPY assets/  ./assets
COPY docs/  ./docs
COPY views ./views
COPY dist/ ./dist
RUN ls -la

CMD ["node","dist/src/main.js" ]