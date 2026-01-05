FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm install

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY . .
USER node
CMD ["node", "index.js"]