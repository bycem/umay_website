import { describe, it, expect } from 'vitest';
import { listSliders, createSlider, updateSlider, deleteSlider, reorderSliders } from '../netlify/handlers/sliders';

function fakeSql(rows: Record<string, unknown>[] = []) {
  const calls: { text: string; values: unknown[] }[] = [];
  const sql = (async (strings: TemplateStringsArray, ...values: unknown[]) => {
    calls.push({ text: strings.join('$'), values });
    return rows;
  }) as any;
  return { sql, calls };
}
const post = (url: string, body: unknown, method = 'POST') =>
  new Request(url, { method, body: JSON.stringify(body), headers: { 'content-type': 'application/json' } });

const validBody = { title: 'Başlık', description: 'Açıklama', image_url: 'https://e.com/a.jpg', is_active: true, sort_order: 0 };

describe('sliders handlers', () => {
  it('listSliders sıralı listeyi döner', async () => {
    const { sql, calls } = fakeSql([{ id: 1 }]);
    const res = await listSliders(sql);
    expect((await res.json()).sliders).toEqual([{ id: 1 }]);
    expect(calls[0].text).toContain('ORDER BY sort_order');
  });
  it('createSlider başlıksız 400', async () => {
    const res = await createSlider(post('http://x/api/sliders', { ...validBody, title: '' }), fakeSql().sql);
    expect(res.status).toBe(400);
  });
  it('createSlider geçersiz görsel URL 400', async () => {
    const res = await createSlider(post('http://x/api/sliders', { ...validBody, image_url: 'ftp://a.jpg' }), fakeSql().sql);
    expect(res.status).toBe(400);
  });
  it('createSlider geçerli veride 201', async () => {
    const { sql } = fakeSql([{ id: 5, ...validBody }]);
    const res = await createSlider(post('http://x/api/sliders', validBody), sql);
    expect(res.status).toBe(201);
  });
  it('updateSlider sayısal olmayan id 400', async () => {
    const res = await updateSlider(post('http://x/api/sliders/abc', validBody, 'PUT'), fakeSql().sql, 'abc');
    expect(res.status).toBe(400);
  });
  it('updateSlider bulunamayan id 404', async () => {
    const res = await updateSlider(post('http://x/api/sliders/9', validBody, 'PUT'), fakeSql([]).sql, '9');
    expect(res.status).toBe(404);
  });
  it('deleteSlider bulunamadı 404, bulundu ok', async () => {
    expect((await deleteSlider(fakeSql([]).sql, '9')).status).toBe(404);
    expect((await deleteSlider(fakeSql([{ id: 9 }]).sql, '9')).status).toBe(200);
  });
  it('reorderSliders her id için UPDATE atar', async () => {
    const { sql, calls } = fakeSql([]);
    const res = await reorderSliders(post('http://x/api/sliders/reorder', { ids: [3, 1, 2] }, 'PUT'), sql);
    expect(res.status).toBe(200);
    expect(calls.filter((c) => c.text.includes('UPDATE')).length).toBe(3);
  });
  it('reorderSliders dizi değilse 400', async () => {
    const res = await reorderSliders(post('http://x/api/sliders/reorder', { ids: 'x' }, 'PUT'), fakeSql().sql);
    expect(res.status).toBe(400);
  });
});
