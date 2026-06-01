# Base image with Node 24 slim
FROM node:24-slim AS base

# Setup PNPM
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
ENV CI=true

# ---- Build Stage ----
FROM base AS build

WORKDIR /frontend

# Copy package manifests first to leverage cache
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies for build
RUN pnpm ci

# Copy the rest of the source code
COPY public/ ./public
COPY src/ ./src

RUN pnpm run build
# ---- Production Stage ----
FROM base AS prod

WORKDIR /frontend

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY --from=build /frontend/build /frontend/build

EXPOSE 3000
CMD ["pnpm", "dlx", "serve", "-s", "build", "-l", "3000"]