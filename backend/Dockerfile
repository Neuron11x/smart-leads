FROM node:20-alpine

WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

RUN npm install

COPY . .

# Build TypeScript to JavaScript
RUN npm run build

EXPOSE 5000

CMD ["node", "dist/index.js"]
