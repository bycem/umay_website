import { createRouter, json, type Route } from '../lib/router';
import { getSessionToken, verifySessionToken } from '../lib/session';
import { login, logout, me } from '../handlers/auth';
import { listSliders, createSlider, updateSlider, deleteSlider, reorderSliders } from '../handlers/sliders';
import { listAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../handlers/announcements';
import type { Sql } from '../lib/rateLimit';

export function buildApi(sql: Sql) {
  const routes: Route[] = [
    { method: 'POST', pattern: '/api/auth/login', handler: (req) => login(req, sql) },
    { method: 'POST', pattern: '/api/auth/logout', handler: async () => logout() },
    { method: 'GET', pattern: '/api/auth/me', handler: async () => me() },
    { method: 'GET', pattern: '/api/sliders', handler: async () => listSliders(sql) },
    { method: 'POST', pattern: '/api/sliders', handler: (req) => createSlider(req, sql) },
    { method: 'PUT', pattern: '/api/sliders/reorder', handler: (req) => reorderSliders(req, sql) }, // :id'den ÖNCE
    { method: 'PUT', pattern: '/api/sliders/:id', handler: (req, p) => updateSlider(req, sql, p.id) },
    { method: 'DELETE', pattern: '/api/sliders/:id', handler: async (_req, p) => deleteSlider(sql, p.id) },
    { method: 'GET', pattern: '/api/announcements', handler: (req) => listAnnouncements(req, sql) },
    { method: 'POST', pattern: '/api/announcements', handler: (req) => createAnnouncement(req, sql) },
    { method: 'PUT', pattern: '/api/announcements/:id', handler: (req, p) => updateAnnouncement(req, sql, p.id) },
    { method: 'DELETE', pattern: '/api/announcements/:id', handler: async (_req, p) => deleteAnnouncement(sql, p.id) },
  ];
  const route = createRouter(routes);

  return async (req: Request): Promise<Response> => {
    const path = new URL(req.url).pathname;
    // CSRF savunması: origin varsa host ile eşleşmeli (mutasyonlarda)
    if (req.method !== 'GET') {
      const origin = req.headers.get('origin');
      const host = req.headers.get('host');
      if (origin && host && new URL(origin).host !== host) return json({ error: 'Geçersiz origin' }, 403);
    }
    // Oturum guard'ı — login hariç her şey korumalı
    if (path !== '/api/auth/login') {
      const token = getSessionToken(req);
      if (!token || !(await verifySessionToken(token))) return json({ error: 'Oturum gerekli' }, 401);
    }
    try {
      return await route(req);
    } catch (err) {
      console.error(err);
      return json({ error: 'Beklenmedik bir hata oluştu' }, 500);
    }
  };
}

export default async (req: Request) => {
  const { sql } = await import('../lib/db');
  return buildApi(sql as unknown as Sql)(req);
};

export const config = { path: '/api/*' };
