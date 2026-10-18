// Orval mutator. SSR loaders call the api directly; the browser stays on its own origin (architecture §3).
const baseUrl = () =>
  typeof window === 'undefined' ? (process.env.API_URL ?? 'http://localhost:3001') : '';

export const fetcher = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(`${baseUrl()}${url}`, init);
  const data = [204, 205, 304].includes(res.status) || !res.body ? undefined : await res.json();
  return { data, status: res.status, headers: res.headers } as T;
};
