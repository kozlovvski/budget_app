import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // Same origin as production (architecture §3): the browser only ever calls /api on this port.
  // `vite preview` reuses this proxy, so the built app can be checked against the api locally.
  server: { port: 3000, proxy: { '/api': 'http://localhost:3001' } },
  resolve: { tsconfigPaths: true },
  // The router plugin must come before React's.
  plugins: [
    tailwindcss(),
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    viteReact(),
  ],
});
