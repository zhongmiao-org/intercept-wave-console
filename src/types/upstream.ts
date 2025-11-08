// Common upstream response types (minimal, per upstream docs)

export type HealthResp = { status: 'ok' };
export type StatusResp = { status: number };
export type DelayResp = { delayedMs: number };
export type HeadersResp = { headers: Record<string, string> };
export type CookiesResp = { cookies: Record<string, string> };
export type LargeResp = { size: number; data: string };
export type RootResp = { service: string; port: number; message?: string };

export type EchoResp = {
  method: string;
  path: string;
  query: string;
  length: number;
  body: string;
};

export type RestItem = { id?: number; [k: string]: any };
export type RestList = { items: RestItem[] };

export type MessageResp = { message: string };
export type CodeData<T = any> = { code: number; data: T };

