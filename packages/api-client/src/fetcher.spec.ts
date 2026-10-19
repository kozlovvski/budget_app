import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetcher, shouldRetry } from './fetcher';

const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
  Response.json({ status: 'ok' }),
);

describe('fetcher', () => {
  beforeEach(() => vi.stubGlobal('fetch', fetchMock));

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockClear();
  });

  it('calls the same origin with the URL unchanged', async () => {
    const res = await fetcher<{ data: unknown; status: number }>('/api/health', { method: 'GET' });

    expect(fetchMock).toHaveBeenCalledWith('/api/health', { method: 'GET' });
    expect(res).toMatchObject({ data: { status: 'ok' }, status: 200 });
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
  });

  it('retries only network errors and 5xx, three times', () => {
    const http = (status: number) => Object.assign(new Error(), { status });

    expect(shouldRetry(0, http(503))).toBe(true);
    expect(shouldRetry(0, new TypeError('fetch failed'))).toBe(true);
    expect(shouldRetry(0, http(404))).toBe(false);
    expect(shouldRetry(3, http(503))).toBe(false);
  });
});
