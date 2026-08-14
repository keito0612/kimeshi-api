# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app

# Bunをインストール
RUN npm install -g bun

# 依存関係インストール
FROM base AS deps
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile || bun install

# Prismaクライアント生成
COPY prisma ./prisma
ENV DATABASE_URL="file:./dev.db"
RUN npx prisma generate

# 開発用
FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV DATABASE_URL="file:./dev.db"
RUN npx prisma generate
EXPOSE 8787
CMD ["bun", "run", "dev"]

# 本番ビルド
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV DATABASE_URL="file:./dev.db"
RUN npx prisma generate
RUN bun run build

# 本番用
FROM base AS prod
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
EXPOSE 8787
CMD ["bun", "run", "start"]
