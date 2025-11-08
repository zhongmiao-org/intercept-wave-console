<template>
  <n-config-provider>
    <n-message-provider>
      <n-space vertical size="large" style="padding: 16px">
        <n-h1>Intercept Wave Console</n-h1>
        <n-alert type="info" closable>
          前端仅访问“插件”暴露的 HTTP/WS 接口；跨域由插件处理。
        </n-alert>
        <n-card>
          <n-tabs type="segment" animated>
            <n-tab-pane name="panel" tab="服务面板">
              <ServicePanel />
            </n-tab-pane>
            <n-tab-pane name="http" tab="HTTP 测试">
              <HttpTester />
            </n-tab-pane>
            <n-tab-pane name="ws" tab="WS 测试">
              <WsTester />
            </n-tab-pane>
            <n-tab-pane name="config" tab="配置概览">
              <ConfigView />
            </n-tab-pane>
            <n-tab-pane name="logs" tab="日志追踪">
              <LogsView />
            </n-tab-pane>
          </n-tabs>
        </n-card>
      </n-space>
    </n-message-provider>
  </n-config-provider>
  </template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRuntimeStore } from './stores/runtime';
import ServicePanel from './components/ServicePanel.vue';
import HttpTester from './components/HttpTester.vue';
import WsTester from './components/WsTester.vue';
import ConfigView from './components/ConfigView.vue';
import LogsView from './components/LogsView.vue';
import { NConfigProvider, NMessageProvider, NAlert, NCard, NSpace, NH1, NTabs, NTabPane } from 'naive-ui';

const runtime = useRuntimeStore();
onMounted(() => runtime.init());
</script>

<style scoped>
</style>
