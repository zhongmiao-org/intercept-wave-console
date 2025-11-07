<template>
  <n-space vertical size="large">
    <n-form label-placement="left" label-width="auto">
      <n-form-item label="目标WS服务">
        <n-select v-model:value="selected" :options="wsOptions" style="min-width: 320px" />
      </n-form-item>
      <n-form-item label="路径追加 (可选)">
        <n-input v-model:value="path" placeholder="与上游一致，例如: /socket 或 socket，留空则不追加" />
      </n-form-item>
      <n-space>
        <n-button type="primary" :disabled="!selected || !!socket" @click="connect">连接</n-button>
        <n-button type="warning" :disabled="!socket" @click="disconnect">断开</n-button>
      </n-space>
    </n-form>

    <n-form label-placement="left" label-width="auto">
      <n-form-item label="发送消息">
        <n-input type="textarea" :rows="4" v-model:value="outgoing" placeholder='{"hello":"ws"} 或 纯文本' />
      </n-form-item>
      <n-button type="primary" :disabled="!socket" @click="send">发送</n-button>
    </n-form>

    <n-h3>消息日志</n-h3>
    <n-code :code="logText" language="json" :word-wrap="true" />
  </n-space>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useRuntimeStore } from '../stores/runtime';
import { NForm, NFormItem, NInput, NButton, NSelect, NSpace, NCode, NH3 } from 'naive-ui';

const runtime = useRuntimeStore();
const selected = ref<string | null>(null);
const socket = ref<WebSocket | null>(null);
const outgoing = ref('');
const logs = ref<string[]>([]);
const path = ref('');

const wsOptions = computed(() => runtime.ws.map((w) => ({ label: `${w.name} (${w.url})`, value: w.url })));
const logText = computed(() => logs.value.join('\n'));

function addLog(type: string, data: any) {
  const ts = new Date().toLocaleTimeString();
  const line = `[${ts}] ${type}: ${typeof data === 'string' ? data : JSON.stringify(data)}`;
  logs.value.unshift(line);
  if (logs.value.length > 300) logs.value.pop();
}

function joinUrl(base: string, extra: string): string {
  const b = base.trim();
  const e = (extra || '').trim();
  if (!e) return b;
  const baseHasSlash = b.endsWith('/');
  const extraHasSlash = e.startsWith('/');
  if (baseHasSlash && extraHasSlash) return b + e.slice(1);
  if (!baseHasSlash && !extraHasSlash) return b + '/' + e;
  return b + e;
}

function connect() {
  if (!selected.value || socket.value) return;
  const url = joinUrl(selected.value, path.value);
  const ws = new WebSocket(url);
  socket.value = ws;
  runtime.log('ws', `connecting ${url}`);

  ws.onopen = () => {
    addLog('open', url);
    runtime.log('ws', `connected ${url}`);
    const item = runtime.ws.find((x) => x.url === url);
    if (item) item.connected = true;
  };
  ws.onmessage = (ev) => {
    addLog('recv', ev.data);
  };
  ws.onerror = (ev) => {
    addLog('error', 'WebSocket error');
    runtime.log('ws', `error ${url}`);
  };
  ws.onclose = () => {
    addLog('close', url);
    runtime.log('ws', `closed ${url}`);
    const item = runtime.ws.find((x) => x.url === url);
    if (item) item.connected = false;
    if (socket.value === ws) socket.value = null;
  };
}

function disconnect() {
  socket.value?.close();
}

function send() {
  if (!socket.value) return;
  let payload: string = outgoing.value;
  try {
    // 尝试格式化为 JSON 字符串，方便可读
    const asObj = JSON.parse(outgoing.value);
    payload = JSON.stringify(asObj);
  } catch {
    // ignore, 以文本发送
  }
  socket.value.send(payload);
  addLog('send', payload);
}

onBeforeUnmount(() => {
  socket.value?.close();
  socket.value = null;
});
</script>
