import { describe, it, expect } from 'vitest';
import { listAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../netlify/handlers/announcements';

function fakeSql(rows: Record<string, unknown>[] = []) {
  const calls: { text: string; values: unknown[] }[] = [];
  const sql = (async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const text = strings.join('$');
    calls.push({ text, values });
    if (text.includes('COUNT')) return [{ count: '7' }];
    return rows;
  }) as any;
  return { sql, calls };
}
const post = (url: string, body: unknown, method = 'POST') =>
  new Request(url, { method, body: JSON.stringify(body), headers: { 'content-type': 'application/json' } });

const validBody = {
  title: 'Duyuru Başlığı',
  content: '<p>İçerik metni</p>',
  publish_date: '2026-07-04T10:00',
  is_active: true,
};

describe('announcements handlers', () => {
  describe('listAnnouncements', () => {
    it('limit 200 verilse bile sorguda 50\'ye kırpılır', async () => {
      const { sql, calls } = fakeSql([{ id: 1 }]);
      const req = new Request('http://x/api/announcements?limit=200');
      const res = await listAnnouncements(req, sql);
      expect(res.status).toBe(200);
      const select = calls.find((c) => !c.text.includes('COUNT'))!;
      expect(select.values).toContain(50);
      expect(select.values).not.toContain(200);
    });

    it('limit parametresi yoksa varsayılan 10 kullanılır', async () => {
      const { sql, calls } = fakeSql([{ id: 1 }]);
      const req = new Request('http://x/api/announcements');
      await listAnnouncements(req, sql);
      const select = calls.find((c) => !c.text.includes('COUNT'))!;
      expect(select.values).toContain(10);
    });

    it('offset parametresi sorguya yansır', async () => {
      const { sql, calls } = fakeSql([{ id: 1 }]);
      const req = new Request('http://x/api/announcements?offset=5');
      await listAnnouncements(req, sql);
      const select = calls.find((c) => !c.text.includes('COUNT'))!;
      expect(select.values).toContain(5);
    });

    it('negatif offset 0\'a kırpılır', async () => {
      const { sql, calls } = fakeSql([{ id: 1 }]);
      const req = new Request('http://x/api/announcements?offset=-3');
      await listAnnouncements(req, sql);
      const select = calls.find((c) => !c.text.includes('COUNT'))!;
      expect(select.values).toContain(0);
      expect(select.values).not.toContain(-3);
    });

    it('yanıt {announcements, total} şeklindedir ve total COUNT sorgusundan gelir', async () => {
      const { sql } = fakeSql([{ id: 1 }, { id: 2 }]);
      const req = new Request('http://x/api/announcements');
      const res = await listAnnouncements(req, sql);
      const body = await res.json();
      expect(body.announcements).toEqual([{ id: 1 }, { id: 2 }]);
      expect(body.total).toBe(7);
    });
  });

  describe('createAnnouncement', () => {
    it('başlıksız istek 400 döner', async () => {
      const res = await createAnnouncement(post('http://x/api/announcements', { ...validBody, title: '' }), fakeSql().sql);
      expect(res.status).toBe(400);
    });

    it('content string değilse 400 döner', async () => {
      const res = await createAnnouncement(post('http://x/api/announcements', { ...validBody, content: 123 }), fakeSql().sql);
      expect(res.status).toBe(400);
    });

    it('content\'i sanitize eder ve summary üretir', async () => {
      const { sql, calls } = fakeSql([{ id: 1 }]);
      const res = await createAnnouncement(
        post('http://x/api/announcements', {
          title: 'T', content: '<p>metin</p><script>alert(1)</script>', publish_date: '2026-07-04T10:00', is_active: true,
        }), sql);
      expect(res.status).toBe(201);
      const insert = calls.find((c) => c.text.includes('INSERT'))!;
      expect(insert.values.join(' ')).not.toContain('<script>');
      expect(insert.values).toContain('metin'); // summary
    });

    it('geçerli veride 201 döner', async () => {
      const { sql } = fakeSql([{ id: 5, ...validBody }]);
      const res = await createAnnouncement(post('http://x/api/announcements', validBody), sql);
      expect(res.status).toBe(201);
    });
  });

  describe('updateAnnouncement', () => {
    it('sayısal olmayan id 400 döner', async () => {
      const res = await updateAnnouncement(post('http://x/api/announcements/abc', validBody, 'PUT'), fakeSql().sql, 'abc');
      expect(res.status).toBe(400);
    });

    it('boş RETURNING sonucunda 404 döner', async () => {
      const res = await updateAnnouncement(post('http://x/api/announcements/9', validBody, 'PUT'), fakeSql([]).sql, '9');
      expect(res.status).toBe(404);
    });

    it('geçerli id\'de 200 döner', async () => {
      const { sql } = fakeSql([{ id: 9, ...validBody }]);
      const res = await updateAnnouncement(post('http://x/api/announcements/9', validBody, 'PUT'), sql, '9');
      expect(res.status).toBe(200);
    });

    it('content\'i yeniden sanitize eder ve summary\'i yeniden üretir', async () => {
      const { sql, calls } = fakeSql([{ id: 9 }]);
      const res = await updateAnnouncement(
        post('http://x/api/announcements/9', {
          title: 'T', content: '<p>metin</p><script>alert(1)</script>', publish_date: '2026-07-04T10:00', is_active: true,
        }, 'PUT'), sql, '9');
      expect(res.status).toBe(200);
      const update = calls.find((c) => c.text.includes('UPDATE'))!;
      expect(update.values.join(' ')).not.toContain('<script>');
      expect(update.values).toContain('metin'); // summary
    });
  });

  describe('deleteAnnouncement', () => {
    it('boş RETURNING sonucunda 404 döner', async () => {
      const res = await deleteAnnouncement(fakeSql([]).sql, '9');
      expect(res.status).toBe(404);
    });

    it('sayısal olmayan id 400 döner', async () => {
      const res = await deleteAnnouncement(fakeSql().sql, 'abc');
      expect(res.status).toBe(400);
    });

    it('geçerli id silindiğinde {ok: true} döner', async () => {
      const res = await deleteAnnouncement(fakeSql([{ id: 9 }]).sql, '9');
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ ok: true });
    });
  });
});
