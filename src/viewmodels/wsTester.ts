import { computed, onBeforeUnmount, ref, watchEffect } from 'vue';
import { useRuntimeStore } from '../stores/runtime';
import { connectWs } from '../services/ws';

export function useWsTesterVM() {
  const runtime = useRuntimeStore();

  const token = ref('');
  watchEffect(() => {
    if (!token.value) token.value = runtime.config?.wsToken || 'zhongmiao-org-token';
  });
  const interval = ref('');
  const path = ref('');
  const params = ref<Array<{ key: string; value: string }>>([]);
  const socket = ref<WebSocket | null>(null);
  const outgoing = ref('');
  const logs = ref<string[]>([]);
  const logText = computed(() => logs.value.join('\n'));

  function addLog(type: string, data: any) {
    const ts = new Date().toLocaleTimeString();
    const line = `[${ts}] ${type}: ${typeof data === 'string' ? data : JSON.stringify(data)}`;
    logs.value.unshift(line);
    if (logs.value.length > 300) logs.value.pop();
  }

  function connect(baseUrl: string | null) {
    if (!baseUrl || socket.value) return;
    const extras: Record<string, string> = Object.fromEntries(
      params.value.filter((x) => x.key).map((x) => [String(x.key), String(x.value)])
    );
    const { url, socket: ws } = connectWs(baseUrl, path.value, {
      token: token.value,
      interval: interval.value || undefined,
      params: extras
    });
    socket.value = ws;
    runtime.log('ws', `connecting ${url}`);

    ws.onopen = () => {
      addLog('open', url);
      runtime.log('ws', `connected ${url}`);
      const item = runtime.ws.find((x) => x.url === baseUrl);
      if (item) item.connected = true;
    };
    ws.onmessage = (ev) => { addLog('recv', ev.data); };
    ws.onerror = (ev: Event) => {
      try {
        addLog('error', { url, readyState: ws.readyState });
      } catch {
        addLog('error', 'WebSocket error');
      }
      runtime.log('ws', `error ${url}`);
    };
    ws.onclose = (ev: CloseEvent) => {
      addLog('close', { url, code: ev.code, reason: ev.reason, clean: ev.wasClean });
      runtime.log('ws', `closed ${url} code=${ev.code}`);
      const item = runtime.ws.find((x) => x.url === baseUrl);
      if (item) item.connected = false;
      if (socket.value === ws) socket.value = null;
    };
  }

  function disconnect() { socket.value?.close(); }

  function send() {
    if (!socket.value) return;
    let payload: string = outgoing.value;
    try { payload = JSON.stringify(JSON.parse(outgoing.value)); } catch { /* text */ }
    socket.value.send(payload);
    addLog('send', payload);
  }

  onBeforeUnmount(() => { socket.value?.close(); socket.value = null; });

  return { token, interval, path, params, socket, outgoing, logs, logText, connect, disconnect, send };
}
