import { describe, it, expect } from 'vitest';
import { matchPath, createRouter, json } from '../netlify/lib/router';

describe('matchPath', () => {
  it('statik path eşleşir', () => expect(matchPath('/api/sliders', '/api/sliders')).toEqual({}));
  it('param yakalar', () => expect(matchPath('/api/sliders/:id', '/api/sliders/7')).toEqual({ id: '7' }));
  it('eşleşmezse null', () => expect(matchPath('/api/sliders', '/api/announcements')).toBeNull());
  it('uzunluk farkında null', () => expect(matchPath('/api/sliders', '/api/sliders/7')).toBeNull());
  it('param decodeURIComponent ile çözülür', () =>
    expect(matchPath('/api/items/:id', '/api/items/a%20b')).toEqual({ id: 'a b' }));
});

describe('createRouter', () => {
  const router = createRouter([
    { method: 'PUT', pattern: '/api/sliders/reorder', handler: async () => json({ hit: 'reorder' }) },
    { method: 'PUT', pattern: '/api/sliders/:id', handler: async (_r, p) => json({ hit: 'id:' + p.id }) },
  ]);
  it('reorder :id\'den önce eşleşir', async () => {
    const res = await router(new Request('http://x/api/sliders/reorder', { method: 'PUT' }));
    expect(await res.json()).toEqual({ hit: 'reorder' });
  });
  it(':id eşleşir', async () => {
    const res = await router(new Request('http://x/api/sliders/5', { method: 'PUT' }));
    expect(await res.json()).toEqual({ hit: 'id:5' });
  });
  it('bilinmeyen path 404 döner', async () => {
    const res = await router(new Request('http://x/api/yok', { method: 'GET' }));
    expect(res.status).toBe(404);
  });

  const trailingSlashRouter = createRouter([
    { method: 'GET', pattern: '/api/x', handler: async () => json({ hit: 'x' }) },
    { method: 'GET', pattern: '/', handler: async () => json({ hit: 'root' }) },
  ]);
  it('sondaki slash normalize edilir', async () => {
    const res = await trailingSlashRouter(new Request('http://x/api/x/', { method: 'GET' }));
    expect(await res.json()).toEqual({ hit: 'x' });
  });
  it('root path eşleşir', async () => {
    const res = await trailingSlashRouter(new Request('http://x/', { method: 'GET' }));
    expect(await res.json()).toEqual({ hit: 'root' });
  });
});
