FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]