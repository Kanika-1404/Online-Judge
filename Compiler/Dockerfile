# Compiler service Dockerfile
FROM node:18-alpine AS compiler

WORKDIR /app

# Install system dependencies for all supported languages
RUN apk update && apk add --no-cache \
    gcc \
    g++ \
    python3 \
    py3-pip \
    make \
    libc-dev \
    openjdk17 \
    openjdk17-jre

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy compiler source code
COPY . .

# Create directories for code execution
RUN mkdir -p codes outputs

# Expose port (will be configured via environment variable)
EXPOSE 8000

# Start the compiler service
CMD ["node", "index.js"]
