/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface ImportMetaEnv {
  readonly VITE_PLUGIN_HTTP_1?: string;
  readonly VITE_PLUGIN_HTTP_2?: string;
  readonly VITE_PLUGIN_HTTP_3?: string;
  readonly VITE_PLUGIN_WS_1?: string;
  readonly VITE_PLUGIN_WS_2?: string;
  readonly VITE_PLUGIN_WS_3?: string;
  readonly VITE_WS_TOKEN?: string;
}
interface ImportMeta { env: ImportMetaEnv }

declare global {
  interface Window { __APP_CONFIG__?: any }
}
