import bcrypt from 'bcryptjs';
import { json } from '../lib/router';
import { createSessionToken, sessionCookie, clearSessionCookie } from '../lib/session';
import { checkLoginAllowed, recordLoginAttempt, clientIp, type Sql } from '../lib/rateLimit';

// Kullanıcı bulunamadığında da sabit süre harcamak için (timing/enumeration savunması).
const DUMMY_HASH = bcrypt.hashSync('umay-timing-dummy-password', 10);

export async function login(req: Request, sql: Sql): Promise<Response> {
  const ip = clientIp(req);
  const { allowed } = await checkLoginAllowed(sql, ip);
  if (!allowed) return json({ error: 'Çok fazla başarısız deneme. Lütfen 15 dakika sonra tekrar deneyin.' }, 429);

  const body = await req.json().catch(() => ({}));
  const username = (body as { username?: unknown }).username;
  const password = (body as { password?: unknown }).password;
  if (typeof username !== 'string' || username.length === 0) return json({ error: 'Kullanıcı adı gerekli' }, 400);
  if (typeof password !== 'string' || password.length === 0) return json({ error: 'Şifre gerekli' }, 400);

  const rows = await sql`SELECT username, password_hash FROM admin_users WHERE username = ${username}`;
  const user = rows[0] as { username: string; password_hash: string } | undefined;
  const ok = (await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH)) && !!user;
  await recordLoginAttempt(sql, ip, ok);
  if (!ok) return json({ error: 'Kullanıcı adı veya şifre hatalı' }, 401);

  const token = await createSessionToken(user!.username);
  return json({ ok: true }, 200, { 'set-cookie': sessionCookie(token) });
}

export function logout(): Response {
  return json({ ok: true }, 200, { 'set-cookie': clearSessionCookie() });
}

export function me(): Response {
  return json({ ok: true });
}
