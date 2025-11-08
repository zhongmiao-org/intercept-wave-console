<template>
  <n-space vertical>
    <n-space>
      <n-button tertiary @click="clear">清空</n-button>
    </n-space>
    <n-data-table :columns="columns" :data="rows" size="small" :single-line="false" />
  </n-space>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRuntimeStore } from '../stores/runtime';
import { NDataTable, NSpace, NButton } from 'naive-ui';

const runtime = useRuntimeStore();
const columns = [
  { title: '时间', key: 'ts', width: 120 },
  { title: '域', key: 'scope', width: 80 },
  { title: '消息', key: 'message' }
];
const rows = computed(() => runtime.logs);
function clear() {
  runtime.$patch({ logs: [] });
}
</script>

