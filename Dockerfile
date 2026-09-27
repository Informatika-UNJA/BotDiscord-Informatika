FROM node:20-bookworm-slim

# better-sqlite3 perlu build tools untuk kompilasi native binding
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN mkdir -p /app/data

VOLUME ["/app/data"]

CMD ["node", "src/index.js"]
