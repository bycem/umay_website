import { describe, it, expect, beforeAll } from 'vitest';
import { buildApi } from '../netlify/functions/api';
import { createSessionToken } from '../netlify/lib/session';

const fakeSql = (async () => []) as any;

beforeAll(() => { process.env.SESSION_SECRET = 'test-secret-en-az-32-karakter-uzun!!'; });

describe('api guard', () => {
  it('oturumsuz istek 401', async () => {
    const res = await buildApi(fakeSql)(new Request('http://x/api/sliders'));
    expect(res.status).toBe(401);
  });
  it('geçerli oturumla geçer', async () => {
    const token = await createSessionToken();
    const res = await buildApi(fakeSql)(new Request('http://x/api/auth/me', { headers: { cookie: `umay_session=${token}` } }));
    expect(res.status).toBe(200);
  });
  it('login oturum istemez (400 döner, 401 değil)', async () => {
    const res = await buildApi(fakeSql)(new Request('http://x/api/auth/login', { method: 'POST', body: '{}' }));
    expect(res.status).not.toBe(401);
  });
  it('cross-origin mutasyon 403', async () => {
    const token = await createSessionToken();
    const res = await buildApi(fakeSql)(new Request('http://x/api/sliders', {
      method: 'POST', body: '{}',
      headers: { cookie: `umay_session=${token}`, origin: 'https://evil.com', host: 'x' },
    }));
    expect(res.status).toBe(403);
  });
});
