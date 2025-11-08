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
    title: '连接',
    key: 'connected',
    render(row: any) {
      const type = row.connected ? 'success' : 'warning';
      const text = row.connected ? '已连接' : '未连接';
      return h(NTag as any, { type }, { default: () => text });
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
</script>
