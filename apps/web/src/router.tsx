import { shouldRetry } from '@budget/api-client';
import { QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import { routeTree } from './routeTree.gen';

export function getRouter() {
  // One client per router, so SSR requests never share cached data.
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: shouldRetry } } });
  const router = createRouter({ routeTree, context: { queryClient }, scrollRestoration: true });
  setupRouterSsrQueryIntegration({ router, queryClient });
  return router;
}
