export type RuntimeConfig = {
  http: { name: string; url: string }[];
  ws: { name: string; url: string }[];
};

function fromEnv(): RuntimeConfig | null {
  const env = (import.meta as any).env || {};
  const http = [1, 2, 3]
    .map((i) => ({ name: `svc${String.fromCharCode(64 + i)}`, url: env[`VITE_PLUGIN_HTTP_${i}`] }))
    .filter((x) => !!x.url) as { name: string; url: string }[];
  const ws = [1, 2, 3]
    .map((i) => ({ name: `ws${String.fromCharCode(64 + i)}`, url: env[`VITE_PLUGIN_WS_${i}`] }))
    .filter((x) => !!x.url) as { name: string; url: string }[];
  if (http.length || ws.length) return { http, ws };
  return null;
}

export async function loadConfig(): Promise<RuntimeConfig> {
  // 1) Prefer /config.json (Docker 运行时 env 渲染)
  try {
    const res = await fetch('/config.json', { cache: 'no-cache' });
    if (res.ok) return (await res.json()) as RuntimeConfig;
  } catch {
    // ignore
  }
  // 2) Fallback to VITE_ 环境变量（本地开发）
  const envConf = fromEnv();
  if (envConf) return envConf;
  // 3) Final fallback: localhost 默认值，便于即开即用
  return {
    http: [
      { name: 'svcA', url: 'http://localhost:9000' },
      { name: 'svcB', url: 'http://localhost:9001' },
      { name: 'svcC', url: 'http://localhost:9002' }
    ],
    ws: [
      { name: 'wsA', url: 'ws://localhost:9003' },
      { name: 'wsB', url: 'ws://localhost:9004' },
      { name: 'wsC', url: 'ws://localhost:9005' }
    ]
  };
}
