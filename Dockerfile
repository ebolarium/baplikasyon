FROM node:20-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

FROM node:20-alpine AS server-deps
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY --from=server-deps /app/node_modules ./node_modules
COPY package*.json ./
COPY server.js ./
COPY config ./config
COPY middleware ./middleware
COPY models ./models
COPY routes ./routes
COPY utils ./utils
COPY --from=client-builder /app/client/build ./client/build

RUN mkdir -p /app/temp

EXPOSE 5000

CMD ["node", "server.js"]
