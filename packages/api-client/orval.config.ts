import { defineConfig } from 'orval';

const input = { target: '../../apps/api/openapi.json' };

export default defineConfig({
  api: {
    input,
    output: {
      target: 'src/generated/api.ts',
      client: 'react-query',
      httpClient: 'fetch',
      clean: true,
      override: {
        mutator: { path: 'src/fetcher.ts', name: 'fetcher' },
        // Route loaders prefetch and components read with useSuspenseQuery.
        query: { useSuspenseQuery: true },
      },
    },
  },
  zod: {
    input,
    output: {
      target: 'src/generated/zod.ts',
      client: 'zod',
    },
  },
});
