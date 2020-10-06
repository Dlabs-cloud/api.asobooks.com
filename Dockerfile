FROM node:12-alpine as builder

ENV NODE_ENV prod

USER node
WORKDIR /home/node

COPY . /home/node

RUN npm ci && npm run build

FROM node:12-alpine

ENV NODE_ENV prod

USER node

WORKDIR /home/node

COPY --from=builder /home/node .

CMD ["node", "dist/src/main.js"]