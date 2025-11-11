/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly WAVE_PLUGIN_HTTP_1?: string;
  readonly WAVE_PLUGIN_HTTP_2?: string;
  readonly WAVE_PLUGIN_HTTP_3?: string;
  readonly WAVE_PLUGIN_WS_1?: string;
  readonly WAVE_PLUGIN_WS_2?: string;
  readonly WAVE_PLUGIN_WS_3?: string;
  readonly WAVE_WS_TOKEN?: string;
}
interface ImportMeta { readonly env: ImportMetaEnv }

declare global {
  interface Window { __APP_CONFIG__?: any }
}

export {};
