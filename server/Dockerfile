FROM node:25-alpine3.22 as builder
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM node:25-alpine3.22 
WORKDIR /app
COPY --from=builder /app .
COPY . .
CMD ["npm", "start"] 