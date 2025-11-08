import { joinUrl, withQuery } from '../lib/net';

export type ConnectOptions = {
  token?: string;
  interval?: string;
  protocols?: string | string[];
};

export function connectWs(base: string, path: string, opts: ConnectOptions = {}) {
  const raw = joinUrl(base, path);
  const url = withQuery(raw, { token: opts.token, interval: opts.interval });
  const ws = new WebSocket(url, opts.protocols);
  return { url, socket: ws, close: () => ws.close() };
}

export { joinUrl, withQuery };

