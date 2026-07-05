import bcrypt from 'bcryptjs';
import { json } from '../lib/router';
import { createSessionToken, sessionCookie, clearSessionCookie } from '../lib/session';
import { checkLoginAllowed, recordLoginAttempt, clientIp, type Sql } from '../lib/rateLimit';

export async function login(req: Request, sql: Sql): Promise<Response> {
  const ip = clientIp(req);
  const { allowed } = await checkLoginAllowed(sql, ip);
  if (!allowed) return json({ error: 'Çok fazla başarısız deneme. Lütfen 15 dakika sonra tekrar deneyin.' }, 429);

  const body = await req.json().catch(() => ({}));
  const password = (body as { password?: unknown }).password;
  if (typeof password !== 'string' || password.length === 0) return json({ error: 'Şifre gerekli' }, 400);

  const ok = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH!);
  await recordLoginAttempt(sql, ip, ok);
  if (!ok) return json({ error: 'Şifre hatalı' }, 401);

  const token = await createSessionToken();
  return json({ ok: true }, 200, { 'set-cookie': sessionCookie(token) });
}

export function logout(): Response {
  return json({ ok: true }, 200, { 'set-cookie': clearSessionCookie() });
}

export function me(): Response {
  return json({ ok: true });
}
