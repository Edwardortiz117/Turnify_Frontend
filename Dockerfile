FROM node:22-alpine AS build
WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ .

# Vacío = same-origin: el navegador llama /api/v1 y Nginx hace proxy al backend.
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

FROM nginx:1.27-alpine AS runtime

COPY frontend/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

# Runtime (compose / CapRover App Configs):
#   BACKEND_SCHEME=https|http
#   BACKEND_UPSTREAM=host:port o hostname (sin esquema)
# CapRover (red interna):  http + srv-captain--turnify-backend:3000
# Backend público:         https + turnify-backend.ingsoftwarefesc.com
# Compose local:           http + host.docker.internal:3000  (override en compose)
ENV BACKEND_SCHEME=https
ENV BACKEND_UPSTREAM=turnify-backend.ingsoftwarefesc.com

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health || exit 1
