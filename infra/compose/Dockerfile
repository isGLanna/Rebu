FROM node:22-alpine AS build

WORKDIR /app

COPY backend/package*.json ./
RUN npm install
COPY ./backend .

EXPOSE 3001

CMD ["npm", "run", "dev"]