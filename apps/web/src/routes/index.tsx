import { getHealthControllerCheckSuspenseQueryOptions } from '@budget/api-client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

const healthQuery = getHealthControllerCheckSuspenseQueryOptions();

export const Route = createFileRoute('/')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(healthQuery);
  },
  component: Home,
});

function Home() {
  const { data } = useSuspenseQuery(healthQuery);
  return <main className="p-4">API status: {data.data.status}</main>;
}
