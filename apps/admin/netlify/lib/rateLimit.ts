export type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, unknown>[]>;

export const IP_LIMIT = 5;
export const GLOBAL_LIMIT = 20;
export const WINDOW_MINUTES = 15;

export async function checkLoginAllowed(sql: Sql, ip: string): Promise<{ allowed: boolean }> {
  await sql`DELETE FROM login_attempts WHERE attempted_at < NOW() - INTERVAL '15 minutes'`;
  const [row] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE ip = ${ip} AND NOT success) AS ip_fails,
      COUNT(*) FILTER (WHERE NOT success) AS global_fails
    FROM login_attempts`;
  const allowed = Number(row.ip_fails) < IP_LIMIT && Number(row.global_fails) < GLOBAL_LIMIT;
  return { allowed };
}

export async function recordLoginAttempt(sql: Sql, ip: string, success: boolean): Promise<void> {
  if (success) {
    await sql`DELETE FROM login_attempts WHERE ip = ${ip}`;
  } else {
    await sql`INSERT INTO login_attempts (ip, success) VALUES (${ip}, FALSE)`;
  }
}

export function clientIp(req: Request): string {
  return (
    req.headers.get('x-nf-client-connection-ip') ??
    (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()
  );
}
