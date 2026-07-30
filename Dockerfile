# Stage 1: Build static assets
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables passed during docker build
ARG VITE_API_URL
ARG VITE_SUPPLY_API_URL

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_SUPPLY_API_URL=${VITE_SUPPLY_API_URL}

# Build production bundle
RUN npm run build

# Stage 2: Serve with Node.js + serve
FROM node:22-alpine AS runner

WORKDIR /app

# Install serve package to serve SPA static files
RUN npm install -g serve

# Copy production build artifacts and entrypoint script
COPY --from=builder /app/dist ./dist
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["serve", "-s", "dist", "-l", "80"]
