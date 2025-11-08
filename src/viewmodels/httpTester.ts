import { ref } from 'vue';
import { useRuntimeStore } from '../stores/runtime';
import { httpRequest, withCommonHeaders } from '../services/http';
import { joinUrl } from '../lib/net';

export type HttpMethod = 'GET' | 'POST';

export function useHttpTesterVM() {
  const runtime = useRuntimeStore();

  const method = ref<HttpMethod>('GET');
  const path = ref('');
  const body = ref('');
  const auth = ref('');
  const reqId = ref('');
  const ua = ref('');
  const withCreds = ref(false);
  const lastReq = ref('');
  const lastRes = ref('');

  async function send(baseUrl: string | null) {
    if (!baseUrl) return;
    const url = joinUrl(baseUrl, path.value);
    const init: RequestInit = { method: method.value };
    if (method.value === 'POST' && body.value) {
      init.headers = { 'Content-Type': 'application/json' };
      try {
        init.body = JSON.stringify(JSON.parse(body.value));
      } catch {
        init.body = body.value; // 原样发出
      }
    }
    Object.assign(init, withCommonHeaders(init, {
      auth: auth.value || undefined,
      ua: ua.value || undefined,
      reqId: reqId.value || undefined
    }));
    if (withCreds.value) init.credentials = 'include';

    lastReq.value = JSON.stringify({ url, ...init, body: init.body ?? undefined }, null, 2);
    try {
      const res = await httpRequest(url, init);
      lastRes.value = JSON.stringify({ ok: res.ok, status: res.status, ms: res.ms, headers: res.headers, body: res.data ?? res.text }, null, 2);
      runtime.log('http', `${method.value} ${url} -> ${res.status} (${res.ms}ms)`);
    } catch (e: any) {
      lastRes.value = JSON.stringify({ error: String(e?.message || e) }, null, 2);
      runtime.log('http', `${method.value} ${url} -> ERROR: ${String(e?.message || e)}`);
    }
  }

  return { method, path, body, auth, reqId, ua, withCreds, lastReq, lastRes, send };
}

