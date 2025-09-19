## ---------- Base builder stage ----------
FROM node:20.17-alpine AS deps
WORKDIR /app
ENV CI=true
COPY package*.json ./
RUN npm ci --no-audit --no-fund

FROM deps AS build
WORKDIR /app
COPY . .
# Copy production environment file
COPY .env.prod .env
RUN npm run build

## ---------- Runtime stage (static files served by nginx) ----------
FROM nginx:1.27.2-alpine AS runtime
LABEL org.opencontainers.image.source="https://github.com/Senfi-Sharif/Senfi-Frontend"
LABEL org.opencontainers.image.description="Senfi Frontend"
LABEL org.opencontainers.image.licenses="GPL-3.0-only"

# Remove default nginx site and add our own minimal config
RUN rm /etc/nginx/conf.d/default.conf
COPY ./nginx.conf /etc/nginx/conf.d/app.conf

## Copy build output
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ || exit 1
ENTRYPOINT ["nginx","-g","daemon off;"]
