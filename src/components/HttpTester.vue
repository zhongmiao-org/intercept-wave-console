<template>
  <n-space vertical size="large">
    <n-form label-placement="left" label-width="auto">
      <n-form-item label="目标HTTP服务">
        <n-select v-model:value="selected" :options="httpOptions" style="min-width: 280px" />
      </n-form-item>
      <n-form-item label="方法">
        <n-radio-group v-model:value="method" name="method">
          <n-radio value="GET">GET</n-radio>
          <n-radio value="POST">POST</n-radio>
        </n-radio-group>
      </n-form-item>
      <n-form-item label="路径追加 (可选)">
        <n-input v-model:value="path" placeholder="例如: /ping 或 ping，留空则不追加" />
      </n-form-item>
      <n-form-item v-if="method === 'POST'" label="Body(JSON)">
        <n-input type="textarea" :rows="6" v-model:value="body" placeholder='{"hello":"world"}' />
      </n-form-item>
      <n-button type="primary" :disabled="!selected" @click="send">发送</n-button>
    </n-form>

    <n-h3>请求</n-h3>
    <n-code :code="lastReq" language="json" :word-wrap="true" />
    <n-h3>响应</n-h3>
    <n-code :code="lastRes" language="json" :word-wrap="true" />
  </n-space>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRuntimeStore } from '../stores/runtime';
import {
  NForm,
  NFormItem,
  NInput,
  NButton,
  NSelect,
  NRadioGroup,
  NRadio,
  NSpace,
  NCode,
  NH3
} from 'naive-ui';

const runtime = useRuntimeStore();
const selected = ref<string | null>(null);
const method = ref<'GET' | 'POST'>('GET');
const path = ref('');
const body = ref('');
const lastReq = ref('');
const lastRes = ref('');

const httpOptions = computed(() => runtime.http.map((h) => ({ label: `${h.name} (${h.url})`, value: h.url })));

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

async function send() {
  if (!selected.value) return;
  const url = joinUrl(selected.value, path.value);
  const init: RequestInit = { method: method.value };
  if (method.value === 'POST' && body.value) {
    init.headers = { 'Content-Type': 'application/json' };
    try {
      init.body = JSON.stringify(JSON.parse(body.value));
    } catch {
      init.body = body.value; // 原样发出
    }
  }

  lastReq.value = JSON.stringify({ url, ...init, body: init.body ?? undefined }, null, 2);
  const t0 = performance.now();
  try {
    const res = await fetch(url, init);
    const text = await res.text();
    let parsed: any = text;
    try { parsed = JSON.parse(text); } catch {}
    const ms = Math.round(performance.now() - t0);
    lastRes.value = JSON.stringify({ ok: res.ok, status: res.status, ms, headers: Object.fromEntries(res.headers.entries()), body: parsed }, null, 2);
    runtime.log('http', `${method.value} ${url} -> ${res.status} (${ms}ms)`);
  } catch (e: any) {
    lastRes.value = JSON.stringify({ error: String(e?.message || e) }, null, 2);
    runtime.log('http', `${method.value} ${url} -> ERROR: ${String(e?.message || e)}`);
  }
}
</script>
