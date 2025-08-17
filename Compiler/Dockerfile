FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN apt-get update && apt-get install -y \
    g++ \
    gcc \
    python3 \
    python3-pip \
    && ln -sf /usr/bin/python3 /usr/bin/python \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 8000

CMD ["npm", "start"]

