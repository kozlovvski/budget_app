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
        // The fetcher throws on 4xx/5xx, so the generated return types hold only the success responses.
        fetch: { forceSuccessResponse: true },
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
