import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  // Resolves the path aliases declared in tsconfig.json, including the ones
  // added by `nest g library`.
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
    coverage: {
      include: ['src/**/*.ts'],
      // Bootstrap, DI wiring and the build-time OpenAPI export: e2e tests and
      // every `generate` run exercise them, unit tests can't.
      exclude: ['src/main*.ts', 'src/**/*.module.ts', 'src/openapi.cli.ts'],
      reporter: ['text'],
      // shortcut: no branch threshold, because emitDecoratorMetadata adds a
      // `typeof X === 'undefined'` branch to every injected class that no test
      // can reach. Add one for pure `domain/` code when it exists.
      thresholds: { lines: 80, statements: 80, functions: 80 },
    },
  },
});
