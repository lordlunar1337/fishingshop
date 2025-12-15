FROM node:20-bullseye-slim

WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./

EXPOSE 4000

CMD ["node", "server.js"]
