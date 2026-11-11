import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: process.env.PORTAL_API_URL || 'http://127.0.0.1:3001',
        // Preserve the browser-facing host for the API's same-origin check.
        changeOrigin: false,
      },
    },
  },
});
