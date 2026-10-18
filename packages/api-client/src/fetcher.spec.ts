import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetcher } from './fetcher';

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
});
