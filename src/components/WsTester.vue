<template>
  <n-space vertical size="large">
    <n-form label-placement="left" label-width="auto">
      <n-form-item label="目标WS服务">
        <n-select v-model:value="selected" :options="wsOptions" style="min-width: 320px" />
      </n-form-item>
      <n-form-item label="令牌(token)">
        <n-input v-model:value="token" placeholder="ws 校验令牌，如 zhongmiao-org-token" />
      </n-form-item>
      <n-form-item label="路径追加 (可选)">
        <n-select
          v-model:value="path"
          :options="wsPathOptions"
          filterable
          clearable
          tag
          placeholder="可下拉选择或手动输入，如 /ws/echo"
          style="min-width: 320px"
        />
      </n-form-item>
      <n-form-item label="额外查询参数">
        <n-dynamic-input
          v-model:value="params"
          preset="pair"
          key-placeholder="key，如 interval"
          value-placeholder="value，如 1000"
          show-sort-button
        />
      </n-form-item>
      <n-form-item label="间隔ms(可选)">
        <n-input v-model:value="interval" placeholder="部分路径需要，如 /ws/ticker（建议 1000）" />
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
import { computed, ref, watch } from 'vue';
import { useRuntimeStore } from '../stores/runtime';
import { useWsTesterVM } from '../viewmodels/wsTester';
import { NForm, NFormItem, NInput, NButton, NSelect, NSpace, NCode, NH3, NDynamicInput } from 'naive-ui';

const runtime = useRuntimeStore();
const selected = ref<string | null>(null);
const vm = useWsTesterVM();
const { socket, outgoing, path, token, interval, params } = vm;

const wsOptions = computed(() => runtime.ws.map((w) => ({ label: `${w.name} (${w.url})`, value: w.url })));
const wsPathOptions = computed(() => [
  { label: '/ws/echo', value: '/ws/echo' },
  { label: '/ws/ticker', value: '/ws/ticker' },
  { label: '/ws/timeline', value: '/ws/timeline' },
  { label: '/ws/food/user', value: '/ws/food/user' },
  { label: '/ws/food/merchant', value: '/ws/food/merchant' }
]);
const logText = vm.logText;

// 日志逻辑已下沉到 ViewModel

// 根据选择的路径智能设置 interval 默认值（/ws/ticker 常用 1000ms）
watch(path, (v) => {
  if (typeof v === 'string' && v.includes('/ws/ticker')) {
    if (!interval.value) interval.value = '1000';
  }
});

function connect() {
  if (!selected.value) return;
  vm.connect(selected.value);
}

function disconnect() { vm.disconnect(); }

function send() { vm.send(); }

// 生命周期清理已由 ViewModel 处理
</script>
