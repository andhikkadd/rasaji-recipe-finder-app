# Stage 1: Build the Vite frontend and generate Prisma client
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npx prisma generate

# Stage 2: Production runtime environment
FROM node:22-alpine
WORKDIR /app

# Copy built frontend assets, Prisma schemas, node_modules, and backend code from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/aiService.js ./aiService.js
COPY --from=builder /app/package.json ./package.json

# Expose port and configure production defaults
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

# Start the server directly
CMD ["node", "server.js"]
