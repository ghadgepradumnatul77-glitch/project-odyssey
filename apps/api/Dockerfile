FROM node:22-bookworm-slim AS api-builder
ENV PRISMA_GENERATE_SKIP_AUTOINSTALL=true
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /workspace/apps/api
COPY apps/api/package.json apps/api/package-lock.json ./
RUN npm ci
RUN ln -s /workspace/apps/api/node_modules /workspace/node_modules
COPY database/prisma /workspace/database/prisma
COPY apps/api/ ./
RUN npx prisma generate --schema /workspace/database/prisma/schema.prisma
RUN npm run build

FROM node:22-bookworm-slim AS api-runtime
ENV NODE_ENV=production
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
COPY apps/api/package.json apps/api/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=api-builder --chown=node:node /workspace/apps/api/.runtime-builds ./.runtime-builds
COPY --chown=node:node apps/api/scripts/start-runtime.cjs ./scripts/start-runtime.cjs
USER node
EXPOSE 4000
CMD ["node", "scripts/start-runtime.cjs"]

FROM node:22-bookworm-slim AS migration
ENV NODE_ENV=production
WORKDIR /workspace
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl postgresql-client \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force
COPY --chown=node:node database/prisma ./database/prisma
COPY --chown=node:node scripts/provision-pilot-db-roles.mjs ./scripts/provision-pilot-db-roles.mjs
USER node
CMD ["npx", "prisma", "migrate", "deploy", "--schema", "database/prisma/schema.prisma"]

FROM postgres:16-bookworm AS backup-runtime
RUN apt-get update \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /ops
COPY --chown=postgres:postgres scripts/backup-postgres.mjs ./scripts/backup-postgres.mjs
USER postgres
ENTRYPOINT ["node", "scripts/backup-postgres.mjs"]
CMD ["create", "--directory", "/backups"]
