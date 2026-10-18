import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetcher, shouldRetry } from './fetcher';

const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
  Response.json({ status: 'ok' }),
);

describe('fetcher', () => {
  beforeEach(() => vi.stubGlobal('fetch', fetchMock));

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    fetchMock.mockClear();
  });

  it('prefixes API_URL on the server', async () => {
    vi.stubEnv('API_URL', 'http://api.internal:3001');

    const res = await fetcher<{ data: unknown; status: number }>('/api/health');

    expect(fetchMock).toHaveBeenCalledWith('http://api.internal:3001/api/health', undefined);
    expect(res).toMatchObject({ data: { status: 'ok' }, status: 200 });
  });

  it('defaults to localhost:3001 on the server', async () => {
    vi.stubEnv('API_URL', undefined);

    await fetcher('/api/health');

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/health', undefined);
  });

  it('uses the same origin in the browser', async () => {
    vi.stubGlobal('window', {});
    vi.stubEnv('API_URL', 'http://api.internal:3001');

    await fetcher('/api/health', { method: 'GET' });

    expect(fetchMock).toHaveBeenCalledWith('/api/health', { method: 'GET' });
  });

  it('rejects on 4xx/5xx with the status and the body', async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ status: 'error' }, { status: 503 }));
    await expect(fetcher('/api/health')).rejects.toMatchObject({
      status: 503,
      info: { status: 'error' },
    });

    // An HTML error page from a proxy must not surface as a JSON SyntaxError.
    fetchMock.mockResolvedValueOnce(new Response('<html>Bad Gateway</html>', { status: 502 }));
    await expect(fetcher('/api/health')).rejects.toMatchObject({
      status: 502,
      info: '<html>Bad Gateway</html>',
    });

    // A body that claims JSON but doesn't parse still rejects with the status, not a SyntaxError.
    fetchMock.mockResolvedValueOnce(
      new Response('{', { status: 500, headers: { 'content-type': 'application/json' } }),
    );
    await expect(fetcher('/api/health')).rejects.toMatchObject({ status: 500, info: undefined });
  });

  it('retries only network errors and 5xx, three times, in the browser', () => {
    const http = (status: number) => Object.assign(new Error(), { status });

    expect(shouldRetry(0, http(503))).toBe(false); // server: no retries

    vi.stubGlobal('window', {});
    expect(shouldRetry(0, http(503))).toBe(true);
    expect(shouldRetry(0, new TypeError('fetch failed'))).toBe(true);
    expect(shouldRetry(0, http(404))).toBe(false);
    expect(shouldRetry(3, http(503))).toBe(false);
  });
});
