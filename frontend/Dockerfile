# Node 17 currently doesn't work with webpack :(
FROM node:alpine

COPY package.json package-lock.json ./frontend/
WORKDIR /frontend

RUN npm ci

CMD ["npm", "start"]
