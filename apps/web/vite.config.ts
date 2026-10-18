import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // Same origin as production (architecture §3): the browser only ever calls /api on this port.
  server: { port: 3000, proxy: { '/api': 'http://localhost:3001' } },
  resolve: { tsconfigPaths: true },
  // Start's plugin must come before React's.
  plugins: [tailwindcss(), tanstackStart(), viteReact()],
});
