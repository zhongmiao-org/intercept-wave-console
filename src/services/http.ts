import { joinUrl } from '../lib/net';

export type HttpResult<T = unknown> = {
  ok: boolean;
  status: number;
  ms: number;
  headers: Record<string, string>;
  data?: T;
  text?: string;
};

export type HttpInit = RequestInit & { expectJson?: boolean };

export async function httpRequest<T = unknown>(url: string, init: HttpInit = {}): Promise<HttpResult<T>> {
  const t0 = performance.now();
  const res = await fetch(url, init);
  const ms = Math.round(performance.now() - t0);

  const headers = Object.fromEntries(res.headers.entries());
  const contentType = res.headers.get('content-type') || '';
  const expectJson = init.expectJson ?? contentType.includes('application/json');

  if (expectJson) {
    let text = await res.text();
    let data: any = undefined;
    try { data = JSON.parse(text); } catch { /* keep text */ }
    return { ok: res.ok, status: res.status, ms, headers, data, text };
  } else {
    const text = await res.text();
    return { ok: res.ok, status: res.status, ms, headers, text };
  }
}

export function buildUrl(base: string, path: string): string {
  return joinUrl(base, path);
}

export function withCommonHeaders(init: RequestInit = {}, extras: { auth?: string; ua?: string; reqId?: string } = {}): RequestInit {
  const hdr: Record<string, string> = {
    ...(init.headers as Record<string, string> | undefined)
  };
  if (extras.auth) hdr['Authorization'] = extras.auth;
  if (extras.ua) hdr['User-Agent'] = extras.ua;
  if (extras.reqId) hdr['X-Request-Id'] = extras.reqId;
  return { ...init, headers: hdr };
}
