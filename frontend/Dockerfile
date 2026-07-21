# syntax=docker/dockerfile:1

# --- Build SPA ---
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vacío = same-origin: el navegador llama /api/v1 y Nginx hace proxy al backend.
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# --- Serve estático + proxy API ---
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

# Host del backend (sin protocolo). Ejemplos:
#   host.docker.internal:3000  → backend en el host
#   backend:3000               → servicio en la misma red Docker
ENV BACKEND_UPSTREAM=host.docker.internal:3000

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health || exit 1
