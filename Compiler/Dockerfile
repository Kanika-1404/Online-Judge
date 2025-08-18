FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN apt-get update && apt-get install -y \
    build-essential \
    g++ \
    gcc \
    python3 \
    python3-pip \
    && ln -sf /usr/bin/python3 /usr/bin/python \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN gcc --version && g++ --version && python3 --version

COPY . .

RUN mkdir -p codes outputs

EXPOSE 4000

CMD ["npm", "start"]