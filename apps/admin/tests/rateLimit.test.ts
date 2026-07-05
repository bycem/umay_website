import { describe, it, expect } from 'vitest';
import { checkLoginAllowed, recordLoginAttempt, clientIp } from '../netlify/lib/rateLimit';

function fakeSql(selectRow: Record<string, unknown>) {
  const calls: string[] = [];
  const sql = async (strings: TemplateStringsArray, ..._v: unknown[]) => {
    const text = strings.join('?');
    calls.push(text);
    return text.includes('SELECT') ? [selectRow] : [];
  };
  return { sql: sql as any, calls };
}

describe('checkLoginAllowed', () => {
  it('eşik altındaysa izin verir ve eski kayıtları temizler', async () => {
    const { sql, calls } = fakeSql({ ip_fails: '2', global_fails: '3' });
    expect((await checkLoginAllowed(sql, '1.2.3.4')).allowed).toBe(true);
    expect(calls.some((c) => c.includes('DELETE'))).toBe(true);
  });
  it('IP eşiğinde (5) reddeder', async () => {
    const { sql } = fakeSql({ ip_fails: '5', global_fails: '5' });
    expect((await checkLoginAllowed(sql, '1.2.3.4')).allowed).toBe(false);
  });
  it('global eşikte (20) reddeder', async () => {
    const { sql } = fakeSql({ ip_fails: '0', global_fails: '20' });
    expect((await checkLoginAllowed(sql, '1.2.3.4')).allowed).toBe(false);
  });
});

describe('recordLoginAttempt', () => {
  it('başarısızda INSERT atar', async () => {
    const { sql, calls } = fakeSql({});
    await recordLoginAttempt(sql, '1.2.3.4', false);
    expect(calls.some((c) => c.includes('INSERT'))).toBe(true);
  });
  it('başarıda IP kayıtlarını siler', async () => {
    const { sql, calls } = fakeSql({});
    await recordLoginAttempt(sql, '1.2.3.4', true);
    expect(calls.some((c) => c.includes('DELETE'))).toBe(true);
    expect(calls.some((c) => c.includes('INSERT'))).toBe(false);
  });
});

describe('clientIp', () => {
  it('Netlify header\'ını önceler', () => {
    const req = new Request('http://x/', { headers: { 'x-nf-client-connection-ip': '9.9.9.9', 'x-forwarded-for': '1.1.1.1, 2.2.2.2' } });
    expect(clientIp(req)).toBe('9.9.9.9');
  });
  it('yoksa x-forwarded-for ilk değeri alır', () => {
    const req = new Request('http://x/', { headers: { 'x-forwarded-for': '1.1.1.1, 2.2.2.2' } });
    expect(clientIp(req)).toBe('1.1.1.1');
  });
  it('hiçbiri yoksa unknown', () => {
    expect(clientIp(new Request('http://x/'))).toBe('unknown');
  });
});
