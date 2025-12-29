FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies
RUN npm install --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose port 3000 (Coolify vai fazer o proxy reverso)
EXPOSE 3025

# Start the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
