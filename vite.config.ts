import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  // Allow both legacy VITE_ and new WAVE_ prefixes to be exposed
  envPrefix: ["VITE_", "WAVE_"],
  server: {
    port: 5173
  }
});
