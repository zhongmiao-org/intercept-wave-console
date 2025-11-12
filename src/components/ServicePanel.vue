<template>
  <n-space vertical size="large">
    <n-h3>HTTP 服务</n-h3>
    <n-data-table :columns="httpColumns" :data="httpData" size="small" />

    <n-h3>WS 服务</n-h3>
    <n-data-table :columns="wsColumns" :data="wsData" size="small" />
  </n-space>
</template>

<script setup lang="ts">
import { computed, h } from 'vue';
import { useRuntimeStore } from '../stores/runtime';
import * as api from '../api/common';
import { NDataTable, NSpace, NH3, NButton, NTag } from 'naive-ui';
import { connectWs } from '../services/ws';

const runtime = useRuntimeStore();

const httpColumns = [
  { title: '名称', key: 'name' },
  { title: 'URL', key: 'url' },
  {
    title: '状态',
    key: 'status',
    render(row: any) {
      const ok = row.lastOk === true;
      const type = ok ? 'success' : row.lastOk === false ? 'error' : 'default';
      const text = ok ? `OK ${row.latency ?? '-'}ms` : row.lastOk === false ? 'ERROR' : '未知';
      return h(NTag as any, { type }, { default: () => text });
    }
  },
  {
    title: '操作',
    key: 'actions',
    render(row: any) {
      return h(NButton as any, { size: 'small', onClick: () => ping(row) }, { default: () => 'Ping' });
    }
  }
];

const wsColumns = [
  { title: '名称', key: 'name' },
  { title: 'URL', key: 'url' },
  {
    title: '状态',
    key: 'status',
    render(row: any) {
      const ok = row.lastOk === true;
      const type = ok ? 'success' : row.lastOk === false ? 'error' : 'default';
      const text = ok ? `OK ${row.latency ?? '-'}ms` : row.lastOk === false ? 'ERROR' : '未知';
      return h(NTag as any, { type }, { default: () => text });
    }
  },
  {
    title: '操作',
    key: 'ws-actions',
    render(row: any) {
      return h(
        NButton as any,
        { size: 'small', onClick: () => wsPing(row) },
        { default: () => 'Ping' }
      );
    }
  }
];

const httpData = computed(() => runtime.http);
const wsData = computed(() => runtime.ws);

async function ping(row: any) {
  const started = performance.now();
  try {
    const res = await api.health(row.url);
    const ok = res.ok;
    row.lastOk = ok;
    row.latency = Math.round(performance.now() - started);
    runtime.log('http', `Ping ${row.name} -> ${ok ? 'OK' : 'ERR'} ${row.latency}ms`);
  } catch (e: any) {
    row.lastOk = false;
    row.latency = undefined;
    row.lastError = String(e?.message || e);
    runtime.log('http', `Ping ${row.name} -> ERROR: ${row.lastError}`);
  }
}

function wsPing(row: any) {
  const started = performance.now();
  let settled = false;
  try {
    const token = runtime.config?.wsToken;
    const { url, socket } = connectWs(row.url, '', { token });

    const finishOk = () => {
      if (settled) return;
      settled = true;
      row.lastOk = true;
      row.latency = Math.round(performance.now() - started);
      runtime.log('ws', `Ping ${row.name} -> OK ${row.latency}ms`);
      try { socket.close(1000, 'ping'); } catch {}
    };
    const finishErr = (reason?: string) => {
      if (settled) return;
      settled = true;
      row.lastOk = false;
      row.latency = undefined;
      row.lastError = reason || 'WebSocket error';
      runtime.log('ws', `Ping ${row.name} -> ERROR ${row.lastError}`);
      try { socket.close(); } catch {}
    };

    const timer = setTimeout(() => finishErr('timeout'), 4000);
    socket.onopen = () => { clearTimeout(timer); finishOk(); };
    socket.onerror = () => { clearTimeout(timer); finishErr(); };
    socket.onclose = (ev) => {
      clearTimeout(timer);
      // If close before open and not settled -> treat as error
      if (!settled) finishErr(`code=${ev.code}${ev.reason ? ` reason=${ev.reason}` : ''}`);
    };
  } catch (e: any) {
    settled = true;
    row.lastOk = false;
    row.latency = undefined;
    row.lastError = String(e?.message || e);
    runtime.log('ws', `Ping ${row.name} -> ERROR ${row.lastError}`);
  }
}
</script>
