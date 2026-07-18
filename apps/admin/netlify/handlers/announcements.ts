import { json } from '../lib/router';
import { makeSummary } from '../lib/summary';
import { sanitizeContent } from '../lib/sanitize';
import { purgeSiteCache } from '../lib/purge';
import type { Sql } from '../lib/rateLimit';

function parseId(id: string): number | null {
  return /^\d+$/.test(id) ? Number(id) : null;
}

type AnnBody = { title?: unknown; content?: unknown; publish_date?: unknown; is_active?: unknown };

function validateAnn(b: AnnBody): { error?: string; data?: { title: string; content: string; summary: string; publish_date: string; is_active: boolean } } {
  if (typeof b.title !== 'string' || !b.title.trim()) return { error: 'Başlık gerekli' };
  if (typeof b.content !== 'string' || !b.content.trim()) return { error: 'İçerik gerekli' };
  const content = sanitizeContent(b.content);
  const publish_date = typeof b.publish_date === 'string' && b.publish_date ? new Date(b.publish_date).toISOString() : new Date().toISOString();
  return { data: { title: b.title.trim(), content, summary: makeSummary(content), publish_date, is_active: b.is_active !== false } };
}

export async function listAnnouncements(req: Request, sql: Sql): Promise<Response> {
  const url = new URL(req.url);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit')) || 10));
  const offset = Math.max(0, Number(url.searchParams.get('offset')) || 0);
  const announcements = await sql`
    SELECT id, title, content, summary, publish_date, is_active FROM announcements
    ORDER BY publish_date DESC LIMIT ${limit} OFFSET ${offset}`;
  const [{ count }] = await sql`SELECT COUNT(*) AS count FROM announcements`;
  return json({ announcements, total: Number(count) });
}

export async function createAnnouncement(req: Request, sql: Sql): Promise<Response> {
  const { error, data } = validateAnn(await req.json().catch(() => ({})));
  if (error) return json({ error }, 400);
  const [row] = await sql`
    INSERT INTO announcements (title, content, summary, publish_date, is_active)
    VALUES (${data!.title}, ${data!.content}, ${data!.summary}, ${data!.publish_date}, ${data!.is_active})
    RETURNING id, title, content, summary, publish_date, is_active`;
  await purgeSiteCache();
  return json({ announcement: row }, 201);
}

export async function updateAnnouncement(req: Request, sql: Sql, id: string): Promise<Response> {
  const numId = parseId(id);
  if (numId === null) return json({ error: 'Geçersiz id' }, 400);
  const { error, data } = validateAnn(await req.json().catch(() => ({})));
  if (error) return json({ error }, 400);
  const rows = await sql`
    UPDATE announcements SET title = ${data!.title}, content = ${data!.content}, summary = ${data!.summary},
      publish_date = ${data!.publish_date}, is_active = ${data!.is_active}, updated_at = NOW()
    WHERE id = ${numId}
    RETURNING id, title, content, summary, publish_date, is_active`;
  if (rows.length === 0) return json({ error: 'Kayıt bulunamadı' }, 404);
  await purgeSiteCache();
  return json({ announcement: rows[0] });
}

export async function deleteAnnouncement(sql: Sql, id: string): Promise<Response> {
  const numId = parseId(id);
  if (numId === null) return json({ error: 'Geçersiz id' }, 400);
  const rows = await sql`DELETE FROM announcements WHERE id = ${numId} RETURNING id`;
  if (rows.length === 0) return json({ error: 'Kayıt bulunamadı' }, 404);
  await purgeSiteCache();
  return json({ ok: true });
}
