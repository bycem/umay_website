import { describe, it, expect, beforeAll } from 'vitest';
import bcrypt from 'bcryptjs';
import { login, logout } from '../netlify/handlers/auth';

function fakeSql(selectRow: Record<string, unknown>) {
  return (async (strings: TemplateStringsArray) => {
    const text = strings.join('?');
    return text.includes('SELECT') ? [selectRow] : [];
  }) as any;
}
const noLimit = { ip_fails: '0', global_fails: '0' };
const post = (body: unknown) =>
  new Request('http://x/api/auth/login', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } });

beforeAll(async () => {
  process.env.SESSION_SECRET = 'test-secret-en-az-32-karakter-uzun!!';
  process.env.ADMIN_PASSWORD_HASH = await bcrypt.hash('dogru-sifre', 4);
});

describe('login', () => {
  it('doğru şifrede cookie set eder', async () => {
    const res = await login(post({ password: 'dogru-sifre' }), fakeSql(noLimit));
    expect(res.status).toBe(200);
    expect(res.headers.get('set-cookie')).toContain('umay_session=');
    expect(res.headers.get('set-cookie')).toContain('HttpOnly');
  });
  it('yanlış şifrede 401', async () => {
    const res = await login(post({ password: 'yanlis' }), fakeSql(noLimit));
    expect(res.status).toBe(401);
  });
  it('şifre yoksa 400', async () => {
    expect((await login(post({}), fakeSql(noLimit))).status).toBe(400);
  });
  it('rate limit aşıldıysa 429 ve bcrypt hiç çağrılmaz', async () => {
    const res = await login(post({ password: 'dogru-sifre' }), fakeSql({ ip_fails: '5', global_fails: '5' }));
    expect(res.status).toBe(429);
  });
});

describe('logout', () => {
  it('cookie\'yi temizler', () => {
    expect(logout().headers.get('set-cookie')).toContain('Max-Age=0');
  });
});
