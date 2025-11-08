import { buildUrl, httpRequest, withCommonHeaders } from '../services/http';
import type {
  CookiesResp,
  DelayResp,
  EchoResp,
  HeadersResp,
  LargeResp,
  RestItem,
  RestList,
  RootResp,
  StatusResp
} from '../types/upstream';

export async function root(base: string) {
  const url = buildUrl(base, '/');
  return httpRequest<RootResp>(url, { method: 'GET' });
}

export async function health(base: string) {
  const url = buildUrl(base, '/health');
  return httpRequest<{ status: 'ok' }>(url, { method: 'GET' });
}

export async function status(base: string, code: number) {
  const url = buildUrl(base, `/status/${code}`);
  return httpRequest<StatusResp>(url, { method: 'GET' });
}

export async function delay(base: string, ms: number) {
  const url = buildUrl(base, `/delay/${ms}`);
  return httpRequest<DelayResp>(url, { method: 'GET' });
}

export async function headers(base: string, extras?: { auth?: string; ua?: string; reqId?: string }) {
  const url = buildUrl(base, `/headers`);
  const init = withCommonHeaders({ method: 'GET' }, extras);
  return httpRequest<HeadersResp>(url, init);
}

export async function cookies(base: string) {
  const url = buildUrl(base, `/cookies`);
  return httpRequest<CookiesResp>(url, { method: 'GET' });
}

export async function large(base: string, size = 65536) {
  const url = buildUrl(base, `/large?size=${encodeURIComponent(size)}`);
  return httpRequest<LargeResp>(url, { method: 'GET' });
}

export async function echo(base: string, method: string, body?: any) {
  const url = buildUrl(base, `/echo`);
  const init: RequestInit = { method };
  if (method !== 'GET' && body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  return httpRequest<EchoResp>(url, init);
}

export async function restList(base: string) {
  const url = buildUrl(base, `/rest/items`);
  return httpRequest<RestList>(url, { method: 'GET' });
}

export async function restCreate(base: string, item: RestItem) {
  const url = buildUrl(base, `/rest/items`);
  const init: RequestInit = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) };
  return httpRequest<RestItem>(url, init);
}

export async function restGet(base: string, id: number | string) {
  const url = buildUrl(base, `/rest/items/${id}`);
  return httpRequest<RestItem>(url, { method: 'GET' });
}

export async function restPut(base: string, id: number | string, item: RestItem) {
  const url = buildUrl(base, `/rest/items/${id}`);
  const init: RequestInit = { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) };
  return httpRequest<RestItem>(url, init);
}

export async function restPatch(base: string, id: number | string, patch: Partial<RestItem>) {
  const url = buildUrl(base, `/rest/items/${id}`);
  const init: RequestInit = { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) };
  return httpRequest<RestItem>(url, init);
}

export async function restDelete(base: string, id: number | string) {
  const url = buildUrl(base, `/rest/items/${id}`);
  return httpRequest<void>(url, { method: 'DELETE', expectJson: false });
}

