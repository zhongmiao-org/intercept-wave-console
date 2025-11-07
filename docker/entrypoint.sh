#!/bin/sh
set -e

if [ -f /usr/share/nginx/html/config.template.json ]; then
  envsubst < /usr/share/nginx/html/config.template.json > /usr/share/nginx/html/config.json
fi

exec "$@"

