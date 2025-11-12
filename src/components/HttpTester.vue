<template>
  <n-space vertical size="large">
    <n-form label-placement="left" label-width="auto">
      <n-form-item label="目标HTTP服务">
        <n-select v-model:value="selected" :options="httpOptions" style="min-width: 280px" />
      </n-form-item>
      <n-form-item label="预设">
        <n-select v-model:value="preset" :options="presetOptions" style="min-width: 320px" @update:value="applyPreset" />
      </n-form-item>
      <n-form-item label="方法">
        <n-radio-group v-model:value="method" name="method">
          <n-radio value="GET">GET</n-radio>
          <n-radio value="POST">POST</n-radio>
        </n-radio-group>
      </n-form-item>
      <n-form-item label="路径追加 (可选)">
        <n-select
          v-model:value="path"
          :options="pathOptions"
          filterable
          clearable
          tag
          placeholder="可下拉选择或手动输入，如 /echo"
          style="min-width: 320px"
        />
      </n-form-item>
      <n-form-item label="Authorization(可选)">
        <n-input v-model:value="auth" placeholder="Bearer ... 或 Basic ..." />
      </n-form-item>
      <n-form-item label="X-Request-Id(可选)">
        <n-input v-model:value="reqId" placeholder="自定义请求ID，/headers 会回显" />
      </n-form-item>
      <n-form-item label="User-Agent(可选)">
        <n-input v-model:value="ua" placeholder="自定义 UA，/headers 会回显" />
      </n-form-item>
      <n-form-item label="凭据(跨域)">
        <n-checkbox v-model:checked="withCreds">credentials: include</n-checkbox>
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
import { useHttpTesterVM } from '../viewmodels/httpTester';
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
  NH3,
  NCheckbox
} from 'naive-ui';

const runtime = useRuntimeStore();
const selected = ref<string | null>(null);
const vm = useHttpTesterVM();
const { method, path, body, lastReq, lastRes, auth, reqId, ua, withCreds } = vm;
const preset = ref<string | null>(null);

const httpOptions = computed(() => runtime.http.map((h) => ({ label: `${h.name} (${h.url})`, value: h.url })));

type PresetItem = { label: string; value: string; method: 'GET' | 'POST'; path: string; body?: any };
const presets: PresetItem[] = [
  { label: 'GET / (服务信息)', value: 'root', method: 'GET', path: '/' },
  { label: 'GET /health', value: 'health', method: 'GET', path: '/health' },
  { label: 'GET /status/200', value: 'status200', method: 'GET', path: '/status/200' },
  { label: 'GET /delay/150', value: 'delay150', method: 'GET', path: '/delay/150' },
  { label: 'GET /headers', value: 'headers', method: 'GET', path: '/headers' },
  { label: 'GET /cookies', value: 'cookies', method: 'GET', path: '/cookies' },
  { label: 'GET /large?size=1024', value: 'large1k', method: 'GET', path: '/large?size=1024' },
  { label: 'ANY /echo', value: 'echo', method: 'POST', path: '/echo', body: { hello: 'world' } },
  { label: 'REST 列表 GET /rest/items', value: 'restList', method: 'GET', path: '/rest/items' },
  { label: 'REST 创建 POST /rest/items', value: 'restCreate', method: 'POST', path: '/rest/items', body: { name: 'demo' } },
  { label: 'GET /api/user/info (9000)', value: 'userInfo', method: 'GET', path: '/api/user/info' },
  { label: 'GET /api/posts (9000)', value: 'userPosts', method: 'GET', path: '/api/posts' },
  { label: 'GET /order-api/orders (9001)', value: 'orders', method: 'GET', path: '/order-api/orders' },
  { label: 'POST /order-api/orders (9001)', value: 'orderCreate', method: 'POST', path: '/order-api/orders', body: { amount: 199 } },
  { label: 'GET /order-api/order/1/submit (9001)', value: 'orderSubmit', method: 'GET', path: '/order-api/order/1/submit' },
  { label: 'GET /pay-api/checkout (9002)', value: 'checkout', method: 'GET', path: '/pay-api/checkout' }
];
const presetOptions = computed(() => presets.map((p) => ({ label: p.label, value: p.value })));
const pathOptions = computed(() => {
  const uniq = Array.from(new Set(presets.map((p) => p.path)));
  return uniq.map((p) => ({ label: p, value: p }));
});

function applyPreset(v: string | null) {
  const p = presets.find((x) => x.value === v!);
  if (!p) return;
  method.value = p.method;
  path.value = p.path;
  body.value = p.body ? JSON.stringify(p.body, null, 2) : '';
}

async function send() {
  await vm.send(selected.value);
}
</script>
