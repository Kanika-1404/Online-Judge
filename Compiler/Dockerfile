# Compiler service Dockerfile with enhanced security
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
    openjdk17-jre \
    # Security tools
    su-exec \
    dumb-init

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy compiler source code
COPY . .

# Create directories for code execution with proper permissions
RUN mkdir -p codes outputs && \
    chmod 755 codes outputs

# Create non-root user for security
RUN addgroup -g 1001 -S compiler && \
    adduser -S compiler -u 1001 -G compiler

# Set ownership
RUN chown -R compiler:compiler /app

# Switch to non-root user
USER compiler

# Expose port
EXPOSE 8000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "index.js"]
