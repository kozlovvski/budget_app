// Orval mutator. The web app is a static SPA, so every call is a relative /api URL on its own origin (architecture §3).
export const fetcher = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(url, init);
  // Reject so TanStack Query enters its error state; same error shape as orval's own fetch client.
  if (!res.ok) {
    const isJson = res.headers.get('content-type')?.includes('json');
    throw Object.assign(new Error(`HTTP ${res.status} ${url}`), {
      status: res.status,
      info: await (isJson ? res.json() : res.text()).catch(() => undefined),
    });
  }
  const data = [204, 205].includes(res.status) || !res.body ? undefined : await res.json();
  return { data, status: res.status, headers: res.headers } as T;
};

// TanStack Query retry policy: retry network errors and 5xx; a 4xx fails the same way again.
export const shouldRetry = (failureCount: number, error: Error): boolean =>
  failureCount < 3 && ((error as Error & { status?: number }).status ?? 500) >= 500;
