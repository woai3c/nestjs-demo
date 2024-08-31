# Stage 1: Base image with global tools
FROM node:18-alpine AS base

RUN npm install -g pnpm pm2

# Stage 2: Install dependencies
FROM base AS dependencies

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY scripts/prepare.mjs ./scripts/prepare.mjs
RUN pnpm install --frozen-lockfile

# Stage 3: Build the application
FROM base AS build

WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN pnpm build

# Stage 4: Install production dependencies
FROM base AS production-dependencies

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY scripts/prepare.mjs ./scripts/prepare.mjs
RUN NODE_ENV=production pnpm install --frozen-lockfile --prod

# Stage 5: Deploy
FROM base AS deploy

WORKDIR /app
COPY package.json ./
COPY --from=build /app/dist/ ./dist/
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY ecosystem.config.js ./

CMD ["pm2-runtime", "start", "ecosystem.config.js"]