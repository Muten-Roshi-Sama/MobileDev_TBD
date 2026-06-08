# Dockerfile (root)
# ---------- BASE ----------
# FROM node:25-slim AS base
# ENV CI=true
# # ENV PATH="/pnpm:$PATH"
# # RUN corepack enable
# RUN npm install -g pnpm@10.28.0

# # ---------- BUILD ----------
# FROM base AS build
# WORKDIR /usr/src/app
# COPY . .

# # install dependencies
# RUN pnpm install --frozen-lockfile

# # build full monorepo
# RUN pnpm run -r build

# # extract only web app (production-ready)
# RUN pnpm deploy --filter=web --prod --legacy /prod/web

# # ---------- WEB RUNTIME ----------
# FROM base AS web
# WORKDIR /prod/web
# COPY --from=build /prod/web /prod/web
# WORKDIR /prod/web

# EXPOSE 3001
# CMD ["pnpm", "serve"]









# FROM node:24-slim

# ENV CI=true

# RUN npm install -g pnpm@10.28.0

# WORKDIR /usr/src/app

# COPY . .

# RUN pnpm install

# # Init db (prisma generate + push)
# COPY packages/db/dbInit.sh /init.sh
# RUN chmod +x /init.sh

# EXPOSE 3001

# ENTRYPOINT ["/init.sh"]
# CMD ["pnpm", "--filter", "web", "dev"]







FROM node:24-slim AS base
ENV CI=true
RUN npm install -g pnpm@10.28.0

COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

EXPOSE 3001

# CMD ["pnpm", "--filter", "web", "dev"]


