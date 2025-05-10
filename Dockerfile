FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY tsconfig.json nest-cli.json ./
COPY . .

RUN npm run build

CMD ["node", "dist/main"]
