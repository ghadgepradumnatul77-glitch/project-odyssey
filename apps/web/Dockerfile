FROM node:22-bookworm-slim AS web-builder
WORKDIR /workspace/apps/web
COPY apps/web/package.json apps/web/package-lock.json ./
RUN npm ci
COPY apps/web/ ./
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine AS web-runtime
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=web-builder /workspace/apps/web/dist /usr/share/nginx/html
EXPOSE 8080
