import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

// Source lives in src/. Cloudflare headers and URLs that must stay stable live in public/.
export default defineConfig({
  root: fileURLToPath(new URL('./src', import.meta.url)),
  publicDir: fileURLToPath(new URL('./public', import.meta.url)),
  build: {
    outDir: fileURLToPath(new URL('./dist', import.meta.url)),
    emptyOutDir: true,
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./src/index.html', import.meta.url)),
        notFound: fileURLToPath(new URL('./src/404.html', import.meta.url)),
      },
    },
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
  },
  server: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
  },
});
