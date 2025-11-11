import { joinUrl, withQuery } from '../lib/net';

export type ConnectOptions = {
  token?: string;
  interval?: string;
  protocols?: string | string[];
  params?: Record<string, string | undefined>;
};

export function connectWs(base: string, path: string, opts: ConnectOptions = {}) {
  const raw = joinUrl(base, path);
  const url = withQuery(raw, { ...(opts.params || {}), token: opts.token, interval: opts.interval });
  const ws = new WebSocket(url, opts.protocols);
  return { url, socket: ws, close: () => ws.close() };
}

export { joinUrl, withQuery };
