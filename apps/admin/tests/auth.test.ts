import { describe, it, expect, beforeAll } from 'vitest';
import bcrypt from 'bcryptjs';
import { login, logout } from '../netlify/handlers/auth';

const noLimit = { ip_fails: '0', global_fails: '0' };

// login iki farklı SELECT yapar: rate-limit sayımı (login_attempts) ve kullanıcı arama (admin_users).
function fakeSql(opts: { limit?: Record<string, unknown>; user?: Record<string, unknown> | null } = {}) {
  const { limit = noLimit, user = null } = opts;
  return (async (strings: TemplateStringsArray) => {
    const text = strings.join('?');
    if (text.includes('FROM admin_users')) return user ? [user] : [];
    if (text.includes('FROM login_attempts')) return [limit];
    return [];
  }) as any;
}
const post = (body: unknown) =>
  new Request('http://x/api/auth/login', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } });

let user: { username: string; password_hash: string };

beforeAll(async () => {
  process.env.SESSION_SECRET = 'test-secret-en-az-32-karakter-uzun!!';
  user = { username: 'bycem', password_hash: await bcrypt.hash('dogru-sifre', 4) };
});

describe('login', () => {
  it('doğru kullanıcı adı + şifrede cookie set eder', async () => {
    const res = await login(post({ username: 'bycem', password: 'dogru-sifre' }), fakeSql({ user }));
    expect(res.status).toBe(200);
    expect(res.headers.get('set-cookie')).toContain('umay_session=');
    expect(res.headers.get('set-cookie')).toContain('HttpOnly');
  });
  it('yanlış şifrede 401', async () => {
    const res = await login(post({ username: 'bycem', password: 'yanlis' }), fakeSql({ user }));
    expect(res.status).toBe(401);
  });
  it('bilinmeyen kullanıcıda 401', async () => {
    const res = await login(post({ username: 'yok', password: 'dogru-sifre' }), fakeSql({ user: null }));
    expect(res.status).toBe(401);
  });
  it('kullanıcı adı yoksa 400', async () => {
    expect((await login(post({ password: 'dogru-sifre' }), fakeSql({ user }))).status).toBe(400);
  });
  it('şifre yoksa 400', async () => {
    expect((await login(post({ username: 'bycem' }), fakeSql({ user }))).status).toBe(400);
  });
  it('rate limit aşıldıysa 429', async () => {
    const res = await login(post({ username: 'bycem', password: 'dogru-sifre' }), fakeSql({ limit: { ip_fails: '5', global_fails: '5' }, user }));
    expect(res.status).toBe(429);
  });
});

describe('logout', () => {
  it('cookie\'yi temizler', () => {
    expect(logout().headers.get('set-cookie')).toContain('Max-Age=0');
  });
});
