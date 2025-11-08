export type RuntimeConfig = {
  http: { name: string; url: string }[];
  ws: { name: string; url: string }[];
  wsToken?: string; // WebSocket 令牌（未提供则使用默认）
};

function fromWindow(): RuntimeConfig | null {
  const anyWin: any = (globalThis as any)?.window || ({} as any);
  const cfg = anyWin.__APP_CONFIG__ as any;
  if (!cfg) return null;
  const http = Array.isArray(cfg.http) ? cfg.http.filter((x: any) => x && x.url) : [];
  const ws = Array.isArray(cfg.ws) ? cfg.ws.filter((x: any) => x && x.url) : [];
  const wsToken = typeof cfg.wsToken === 'string' && cfg.wsToken ? cfg.wsToken : undefined;
  if (http.length || ws.length || wsToken) return { http, ws, wsToken } as RuntimeConfig;
  return null;
}

function fromEnv(): RuntimeConfig | null {
  const env = import.meta.env || {};
  const httpRaw = [env.VITE_PLUGIN_HTTP_1, env.VITE_PLUGIN_HTTP_2, env.VITE_PLUGIN_HTTP_3];
  const wsRaw = [env.VITE_PLUGIN_WS_1, env.VITE_PLUGIN_WS_2, env.VITE_PLUGIN_WS_3];
  const http = httpRaw
    .map((url, i) => ({ name: `svc${String.fromCharCode(65 + i)}`, url }))
    .filter((x) => !!x.url) as { name: string; url: string }[];
  const ws = wsRaw
    .map((url, i) => ({ name: `ws${String.fromCharCode(65 + i)}`, url }))
    .filter((x) => !!x.url) as { name: string; url: string }[];
  const wsToken = env.VITE_WS_TOKEN as string | undefined;
  if (http.length || ws.length || wsToken) return { http, ws, wsToken };
  return null;
}

export async function loadConfig(): Promise<RuntimeConfig> {
  // 1) 运行时 window.__APP_CONFIG__（Docker 入口脚本渲染）
  const winConf = fromWindow();
  if (winConf) return { wsToken: 'zhongmiao-org-token', ...winConf };
  // 2) VITE_ 环境变量（本地开发构建时）
  const envConf = fromEnv();
  if (envConf) return { wsToken: 'zhongmiao-org-token', ...envConf };
  // Final fallback: localhost 默认值，便于即开即用
  return {
    http: [
      { name: 'user-service', url: 'http://localhost:9000' },
      { name: 'order-service', url: 'http://localhost:9001' },
      { name: 'payment-service', url: 'http://localhost:9002' }
    ],
    ws: [
      { name: 'ws-echo', url: 'ws://localhost:9003' },
      { name: 'ws-ticker', url: 'ws://localhost:9004' },
      { name: 'ws-timeline', url: 'ws://localhost:9005' }
    ],
    wsToken: 'zhongmiao-org-token'
  };
}
