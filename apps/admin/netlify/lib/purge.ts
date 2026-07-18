export async function purgeSiteCache(): Promise<void> {
  const token = process.env.NETLIFY_PURGE_TOKEN;
  const siteId = process.env.NETLIFY_SITE_ID;
  if (!token || !siteId) return;

  try {
    await fetch('https://api.netlify.com/api/v1/purge', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ site_id: siteId, cache_tags: ['site'] }),
    });
  } catch (err) {
    console.error('Cache purge failed', err);
  }
}
