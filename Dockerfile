FROM node:20-slim AS builder

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:20-slim AS production

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies
RUN npm install --omit=dev && npm cache clean --force

# Install Prisma CLI globally for migrations
RUN npm install -g prisma@5.8.0

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose port (Coolify vai fazer o proxy reverso)
EXPOSE 3025

# Start the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
