import { SignJWT, jwtVerify } from 'jose';

const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET!);
const COOKIE = 'umay_session';

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret());
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

export function sessionCookie(token: string): string {
  return `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`;
}

export function clearSessionCookie(): string {
  return `${COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

export function getSessionToken(req: Request): string | null {
  const m = (req.headers.get('cookie') ?? '').match(/(?:^|;\s*)umay_session=([^;]+)/);
  return m ? m[1] : null;
}
