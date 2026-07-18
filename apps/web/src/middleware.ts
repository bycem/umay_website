import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (ctx, next) => {
  const response = await next();

  const isGet = ctx.request.method === 'GET';
  const isApi = ctx.url.pathname.startsWith('/api/');
  const isHtmlOk = response.status === 200;

  if (isGet && !isApi && isHtmlOk) {
    response.headers.set(
      'Netlify-CDN-Cache-Control',
      'public, durable, s-maxage=31536000, stale-while-revalidate=86400',
    );
    response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
    response.headers.set('Netlify-Cache-Tag', 'site');
  }

  return response;
});
