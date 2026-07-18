import { json } from '../lib/router';
import { isValidImageUrl } from '../lib/imageUrl';
import { purgeSiteCache } from '../lib/purge';
import type { Sql } from '../lib/rateLimit';

function parseId(id: string): number | null {
  return /^\d+$/.test(id) ? Number(id) : null;
}

type SliderBody = { title?: unknown; description?: unknown; image_url?: unknown; is_active?: unknown; sort_order?: unknown; publish_date?: unknown; end_date?: unknown };

function validateSlider(b: SliderBody): { error?: string; data?: { title: string; description: string; image_url: string; is_active: boolean; sort_order: number; publish_date: string; end_date: string | null } } {
  if (typeof b.title !== 'string' || !b.title.trim()) return { error: 'Başlık gerekli' };
  if (typeof b.image_url !== 'string' || !isValidImageUrl(b.image_url)) return { error: "Geçerli bir görsel URL'si girin" };
  const publish_date = typeof b.publish_date === 'string' && b.publish_date ? new Date(b.publish_date).toISOString() : new Date().toISOString();
  const end_date = typeof b.end_date === 'string' && b.end_date ? new Date(b.end_date).toISOString() : null;
  if (end_date && end_date < publish_date) return { error: 'Bitiş tarihi yayın tarihinden önce olamaz' };
  return {
    data: {
      title: b.title.trim(),
      description: typeof b.description === 'string' ? b.description : '',
      image_url: b.image_url,
      is_active: b.is_active !== false,
      sort_order: Number.isInteger(b.sort_order) ? (b.sort_order as number) : 0,
      publish_date,
      end_date,
    },
  };
}

export async function listSliders(sql: Sql): Promise<Response> {
  const sliders = await sql`SELECT id, title, description, image_url, is_active, sort_order, publish_date, end_date FROM sliders ORDER BY sort_order, id`;
  return json({ sliders });
}

export async function createSlider(req: Request, sql: Sql): Promise<Response> {
  const { error, data } = validateSlider(await req.json().catch(() => ({})));
  if (error) return json({ error }, 400);
  const [row] = await sql`
    INSERT INTO sliders (title, description, image_url, is_active, sort_order, publish_date, end_date)
    VALUES (${data!.title}, ${data!.description}, ${data!.image_url}, ${data!.is_active}, ${data!.sort_order}, ${data!.publish_date}, ${data!.end_date})
    RETURNING id, title, description, image_url, is_active, sort_order, publish_date, end_date`;
  await purgeSiteCache();
  return json({ slider: row }, 201);
}

export async function updateSlider(req: Request, sql: Sql, id: string): Promise<Response> {
  const numId = parseId(id);
  if (numId === null) return json({ error: 'Geçersiz id' }, 400);
  const { error, data } = validateSlider(await req.json().catch(() => ({})));
  if (error) return json({ error }, 400);
  const rows = await sql`
    UPDATE sliders SET title = ${data!.title}, description = ${data!.description}, image_url = ${data!.image_url},
      is_active = ${data!.is_active}, sort_order = ${data!.sort_order}, publish_date = ${data!.publish_date}, end_date = ${data!.end_date}, updated_at = NOW()
    WHERE id = ${numId}
    RETURNING id, title, description, image_url, is_active, sort_order, publish_date, end_date`;
  if (rows.length === 0) return json({ error: 'Kayıt bulunamadı' }, 404);
  await purgeSiteCache();
  return json({ slider: rows[0] });
}

export async function deleteSlider(sql: Sql, id: string): Promise<Response> {
  const numId = parseId(id);
  if (numId === null) return json({ error: 'Geçersiz id' }, 400);
  const rows = await sql`DELETE FROM sliders WHERE id = ${numId} RETURNING id`;
  if (rows.length === 0) return json({ error: 'Kayıt bulunamadı' }, 404);
  await purgeSiteCache();
  return json({ ok: true });
}

export async function reorderSliders(req: Request, sql: Sql): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  const ids = (body as { ids?: unknown }).ids;
  if (!Array.isArray(ids) || !ids.every((n) => Number.isInteger(n))) return json({ error: 'ids tam sayı dizisi olmalı' }, 400);
  for (let i = 0; i < ids.length; i++) {
    await sql`UPDATE sliders SET sort_order = ${i}, updated_at = NOW() WHERE id = ${ids[i]}`;
  }
  await purgeSiteCache();
  return json({ ok: true });
}
