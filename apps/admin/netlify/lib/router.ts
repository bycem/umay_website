export type Handler = (req: Request, params: Record<string, string>) => Promise<Response>;
export type Route = { method: string; pattern: string; handler: Handler };

export function matchPath(pattern: string, path: string): Record<string, string> | null {
  const pp = pattern.split('/').filter(Boolean);
  const sp = path.split('/').filter(Boolean);
  if (pp.length !== sp.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith(':')) params[pp[i].slice(1)] = decodeURIComponent(sp[i]);
    else if (pp[i] !== sp[i]) return null;
  }
  return params;
}

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });
}

export function createRouter(routes: Route[]) {
  return async (req: Request): Promise<Response> => {
    const path = new URL(req.url).pathname.replace(/\/+$/, '') || '/';
    for (const r of routes) {
      if (r.method !== req.method) continue;
      const params = matchPath(r.pattern, path);
      if (params) return r.handler(req, params);
    }
    return json({ error: 'Bulunamadı' }, 404);
  };
}
