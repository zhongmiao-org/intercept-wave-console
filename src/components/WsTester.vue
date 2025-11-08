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
        <n-input v-model:value="path" placeholder="与上游一致，例如: /socket 或 socket，留空则不追加" />
      </n-form-item>
      <n-form-item label="间隔ms(可选)">
        <n-input v-model:value="interval" placeholder="部分路径支持，如 /ws/ticker" />
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
import { computed, ref } from 'vue';
import { useRuntimeStore } from '../stores/runtime';
import { useWsTesterVM } from '../viewmodels/wsTester';
import { NForm, NFormItem, NInput, NButton, NSelect, NSpace, NCode, NH3 } from 'naive-ui';

const runtime = useRuntimeStore();
const selected = ref<string | null>(null);
const vm = useWsTesterVM();
const { socket, outgoing, logs, path, token, interval } = vm;

const wsOptions = computed(() => runtime.ws.map((w) => ({ label: `${w.name} (${w.url})`, value: w.url })));
const logText = vm.logText;

// 日志逻辑已下沉到 ViewModel

function connect() {
  if (!selected.value) return;
  vm.connect(selected.value);
}

function disconnect() { vm.disconnect(); }

function send() { vm.send(); }

// 生命周期清理已由 ViewModel 处理
</script>
