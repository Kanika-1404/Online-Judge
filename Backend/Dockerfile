# Backend API Service Dockerfile
FROM node:18-alpine AS backend

WORKDIR /app

# Install dependencies for database connections and DNS lookups
RUN apk update && apk add --no-cache \
    python3 \
    make \
    g++ \
    musl-dev \
    bind-tools   # Needed for SRV DNS resolution for mongodb+srv

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy backend source code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S backend -u 1001
RUN chown -R backend:nodejs /app

# Switch to non-root user
USER backend

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start the backend server
CMD ["node", "index.js"]
