FROM node:20-alpine AS builder

# Install OpenSSL and other dependencies for Prisma
RUN apk add --no-cache openssl1.1-compat

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS production

# Install OpenSSL and other dependencies for Prisma
RUN apk add --no-cache openssl1.1-compat

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies
RUN npm install --omit=dev && npm cache clean --force

# Install Prisma CLI globally for migrations
RUN npm install -g prisma@5.8.0

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose port 3000 (Coolify vai fazer o proxy reverso)
EXPOSE 3025

# Start the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
