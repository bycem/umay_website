import { describe, it, expect } from 'vitest';
import { getActiveSliders, getRecentAnnouncements, getAnnouncementById } from '../src/lib/queries';

function fakeSql(rows: unknown[] = []) {
  const calls: string[] = [];
  const sql = (async (strings: TemplateStringsArray) => { calls.push(strings.join('$')); return rows; }) as any;
  return { sql, calls };
}

describe('queries', () => {
  it('sliders yalnız aktifleri sıralı çeker', async () => {
    const { sql, calls } = fakeSql();
    await getActiveSliders(sql);
    expect(calls[0]).toContain('is_active');
    expect(calls[0]).toContain('ORDER BY sort_order');
  });
  it('duyurular görünürlük kuralını uygular', async () => {
    const { sql, calls } = fakeSql();
    await getRecentAnnouncements(sql, 6);
    expect(calls[0]).toContain('publish_date <= NOW()');
    expect(calls[0]).toContain('is_active');
  });
  it('tek duyuru bulunamazsa null', async () => {
    expect(await getAnnouncementById(fakeSql([]).sql, 5)).toBeNull();
  });
  it('tek duyuru bulunursa satırı döner', async () => {
    expect(await getAnnouncementById(fakeSql([{ id: 5 }]).sql, 5)).toEqual({ id: 5 });
  });
});
