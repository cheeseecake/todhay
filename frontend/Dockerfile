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
RUN pnpm install --frozen-lockfile

# Copy the rest of the source code
COPY . .

RUN pnpm run build
RUN pnpm add serve --save-dev
# ---- Production Stage ----
FROM base AS prod

WORKDIR /frontend

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY --from=build /frontend/node_modules /frontend/node_modules
COPY --from=build /frontend/build /frontend/build

EXPOSE 3000
ENV PATH="/frontend/node_modules/.bin:$PATH"
CMD ["serve", "-s", "build", "-l", "3000"]