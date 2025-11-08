# Dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm i --no-audit --no-fund
COPY . .
# Optional build-time env overrides for Vite (prefix VITE_ is required)
ARG VITE_PLUGIN_HTTP_1
ARG VITE_PLUGIN_HTTP_2
ARG VITE_PLUGIN_HTTP_3
ARG VITE_PLUGIN_WS_1
ARG VITE_PLUGIN_WS_2
ARG VITE_PLUGIN_WS_3
ARG VITE_WS_TOKEN
ENV VITE_PLUGIN_HTTP_1=$VITE_PLUGIN_HTTP_1 \
    VITE_PLUGIN_HTTP_2=$VITE_PLUGIN_HTTP_2 \
    VITE_PLUGIN_HTTP_3=$VITE_PLUGIN_HTTP_3 \
    VITE_PLUGIN_WS_1=$VITE_PLUGIN_WS_1 \
    VITE_PLUGIN_WS_2=$VITE_PLUGIN_WS_2 \
    VITE_PLUGIN_WS_3=$VITE_PLUGIN_WS_3 \
    VITE_WS_TOKEN=$VITE_WS_TOKEN
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/default.conf /etc/nginx/conf.d/default.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx","-g","daemon off;"]
