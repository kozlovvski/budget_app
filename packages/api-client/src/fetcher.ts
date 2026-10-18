// Orval mutator. SSR loaders call the api directly; the browser stays on its own origin (architecture §3).
const baseUrl = () =>
  typeof window === 'undefined' ? (process.env.API_URL ?? 'http://localhost:3001') : '';

export const fetcher = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(`${baseUrl()}${url}`, init);
  // Reject so TanStack Query enters its error state; same error shape as orval's own fetch client.
  if (!res.ok) {
    const isJson = res.headers.get('content-type')?.includes('json');
    throw Object.assign(new Error(`HTTP ${res.status} ${url}`), {
      status: res.status,
      info: await (isJson ? res.json() : res.text()).catch(() => undefined),
    });
  }
  const data = [204, 205, 304].includes(res.status) || !res.body ? undefined : await res.json();
  return { data, status: res.status, headers: res.headers } as T;
};
