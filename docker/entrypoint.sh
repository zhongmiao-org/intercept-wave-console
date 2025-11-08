#!/bin/sh
set -e

DOC_ROOT=/usr/share/nginx/html

# Assemble runtime config.js from environment variables
# Supported env vars: HTTP_1..3, WS_1..3, WS_TOKEN
cat > "$DOC_ROOT/config.js" <<EOF
(function(){
  function v(x){ return typeof x === 'string' ? x : ''; }
  var cfg = {
    http: [
      { name: 'user-service', url: v('${HTTP_1}') },
      { name: 'order-service', url: v('${HTTP_2}') },
      { name: 'payment-service', url: v('${HTTP_3}') }
    ].filter(function(x){ return x.url; }),
    ws: [
      { name: 'ws-echo', url: v('${WS_1}') },
      { name: 'ws-ticker', url: v('${WS_2}') },
      { name: 'ws-timeline', url: v('${WS_3}') }
    ].filter(function(x){ return x.url; }),
    wsToken: v('${WS_TOKEN}') || 'zhongmiao-org-token'
  };
  window.__APP_CONFIG__ = cfg;
})();
EOF

exec "$@"
