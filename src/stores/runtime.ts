import {defineStore} from 'pinia';
import type {RuntimeConfig} from '../lib/config';
import {loadConfig} from '../lib/config';

export type HttpStatus = {
  name: string;
  url: string;
  latency?: number;
  lastOk?: boolean;
  lastError?: string;
};

export type WsStatus = {
  name: string;
  url: string;
  connected: boolean;
  lastError?: string;
};

export type LogItem = { ts: string; scope: 'http' | 'ws' | 'sys'; message: string };

export const useRuntimeStore = defineStore('runtime', {
  state: () => ({
    config: null as RuntimeConfig | null,
    http: [] as HttpStatus[],
    ws: [] as WsStatus[],
    logs: [] as LogItem[]
  }),
  actions: {
    async init() {
      this.log('sys', '初始化运行时配置...');
      this.config = await loadConfig();
      this.http = this.config.http.map((h) => ({ name: h.name, url: h.url }));
      this.ws = this.config.ws.map((w) => ({ name: w.name, url: w.url, connected: false }));
      this.log('sys', '配置加载完成');
    },
    log(scope: 'http' | 'ws' | 'sys', message: string) {
      const ts = new Date().toLocaleTimeString();
      this.logs.unshift({ ts, scope, message });
      if (this.logs.length > 500) this.logs.pop();
    }
  }
});
