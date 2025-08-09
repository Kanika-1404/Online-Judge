# Multi-stage build for the main backend service
FROM node:18-alpine AS backend

WORKDIR /app

# Copy package files
COPY Backend/package*.json ./
RUN npm ci --only=production

# Copy backend source code
COPY Backend ./

# Install system dependencies for code compilation
RUN apk add --no-cache \
    gcc \
    g++ \
    python3 \
    make \
    libc-dev

# Expose port
EXPOSE 5000

# Start the backend server
CMD ["node", "index.js"]
