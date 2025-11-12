<template>
  <n-space vertical>
    <n-h3>当前运行时配置（WAVE_ 环境变量）</n-h3>
    <n-code :code="rtJson" language="json" :word-wrap="true" />
  </n-space>
  </template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRuntimeStore } from '../stores/runtime';
import { NCode, NSpace, NH3 } from 'naive-ui';

const runtime = useRuntimeStore();
const rtJson = computed(() => JSON.stringify(runtime.config || {}, null, 2));
</script>
