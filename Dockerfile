# MCP Server - Single Stage Build
FROM node:20-alpine

WORKDIR /app

# Install build dependencies and pnpm
RUN apk add --no-cache python3 make g++ curl && \
    npm install -g pnpm

# Copy all project files
COPY package*.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json ./
COPY pnpm-workspace.yaml ./
COPY packages packages/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Build the project
RUN pnpm build

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start server
CMD ["node", "packages/mcp-server/dist/server.js"]
