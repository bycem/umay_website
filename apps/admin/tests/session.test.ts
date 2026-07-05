import { describe, it, expect, beforeAll } from 'vitest';
import { createSessionToken, verifySessionToken, sessionCookie, clearSessionCookie, getSessionToken } from '../netlify/lib/session';

beforeAll(() => { process.env.SESSION_SECRET = 'test-secret-en-az-32-karakter-uzun!!'; });

describe('session', () => {
  it('üretilen token doğrulanır', async () => {
    expect(await verifySessionToken(await createSessionToken())).toBe(true);
  });
  it('bozuk token reddedilir', async () => {
    expect(await verifySessionToken('sahte.token.x')).toBe(false);
  });
  it('cookie güvenlik flag\'lerini içerir', () => {
    const c = sessionCookie('abc');
    for (const part of ['umay_session=abc', 'HttpOnly', 'Secure', 'SameSite=Strict', 'Path=/', 'Max-Age=86400']) {
      expect(c).toContain(part);
    }
  });
  it('clear cookie Max-Age=0 içerir', () => {
    expect(clearSessionCookie()).toContain('Max-Age=0');
  });
  it('request\'ten token okur', () => {
    const req = new Request('http://x/', { headers: { cookie: 'a=1; umay_session=tok123; b=2' } });
    expect(getSessionToken(req)).toBe('tok123');
    expect(getSessionToken(new Request('http://x/'))).toBeNull();
  });
});
