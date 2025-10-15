# Stage 1: Build
FROM node:22.20.0-alpine3.22 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:22.20.0-alpine3.22
WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
ENV NODE_ENV=production
RUN npm ci --omit=dev

# Copy built application
COPY --from=builder /app/dist ./dist

# Copy PM2 config
COPY ecosystem.config.cjs ./

# Install PM2 globally
RUN npm install -g pm2

# Set ownership and permissions
RUN chown -R node:node /app && \
    chmod -R 755 /app

# Switch to non-root user
USER node

# Expose application port
EXPOSE 8000

# Start with PM2
CMD ["pm2-runtime", "start", "ecosystem.config.cjs"]