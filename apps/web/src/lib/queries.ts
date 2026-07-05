export type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, unknown>[]>;

export type Slider = { id: number; title: string; description: string | null; image_url: string };
export type Announcement = { id: number; title: string; content: string; summary: string | null; publish_date: string };

export async function getActiveSliders(sql: Sql): Promise<Slider[]> {
  return (await sql`
    SELECT id, title, description, image_url FROM sliders
    WHERE is_active ORDER BY sort_order, id`) as Slider[];
}

export async function getRecentAnnouncements(sql: Sql, limit: number): Promise<Announcement[]> {
  return (await sql`
    SELECT id, title, summary, publish_date, content FROM announcements
    WHERE is_active AND publish_date <= NOW()
    ORDER BY publish_date DESC LIMIT ${limit}`) as Announcement[];
}

export async function getAnnouncementById(sql: Sql, id: number): Promise<Announcement | null> {
  const rows = await sql`
    SELECT id, title, content, summary, publish_date FROM announcements
    WHERE id = ${id} AND is_active AND publish_date <= NOW()`;
  return (rows[0] as Announcement) ?? null;
}
