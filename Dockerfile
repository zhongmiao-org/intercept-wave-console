# Dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm i --no-audit --no-fund
COPY . .
# Optional build-time env overrides for Vite (support WAVE_ prefix)
ARG WAVE_PLUGIN_HTTP_1
ARG WAVE_PLUGIN_HTTP_2
ARG WAVE_PLUGIN_HTTP_3
ARG WAVE_PLUGIN_WS_1
ARG WAVE_PLUGIN_WS_2
ARG WAVE_PLUGIN_WS_3
ARG WAVE_WS_TOKEN
# Vite reads envs by prefix; we expose both to ease migration
ENV WAVE_PLUGIN_HTTP_1=$WAVE_PLUGIN_HTTP_1 \
    WAVE_PLUGIN_HTTP_2=$WAVE_PLUGIN_HTTP_2 \
    WAVE_PLUGIN_HTTP_3=$WAVE_PLUGIN_HTTP_3 \
    WAVE_PLUGIN_WS_1=$WAVE_PLUGIN_WS_1 \
    WAVE_PLUGIN_WS_2=$WAVE_PLUGIN_WS_2 \
    WAVE_PLUGIN_WS_3=$WAVE_PLUGIN_WS_3 \
    WAVE_WS_TOKEN=$WAVE_WS_TOKEN
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/default.conf /etc/nginx/conf.d/default.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx","-g","daemon off;"]
