# -------------------------------------------------------------
# Dockerfile: Instructions for containerizing Paquito's Pizza (Next.js)
# -------------------------------------------------------------

# 1. Base Image: Use official Node.js 22 Lightweight Alpine Linux
FROM node:22-alpine AS base

# 2. Set Working Directory inside the container
WORKDIR /app

# 3. Copy dependency manifests first (for caching layers)
COPY package*.json ./

# 4. Install project dependencies cleanly
RUN npm ci

# 5. Copy the entire source code into the container
COPY . .

# 6. Disable Next.js telemetry & Build the production application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# 7. Expose Port 3000 for web traffic
EXPOSE 3000
ENV PORT 3000
ENV NODE_ENV production

# 8. Command to start the application when container launches
CMD ["npm", "start"]