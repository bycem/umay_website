import postgres from 'postgres';
import { readdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const url = process.env.NETLIFY_DATABASE_URL;
if (!url) { console.error('NETLIFY_DATABASE_URL gerekli'); process.exit(1); }
const sql = postgres(url, { prepare: false });
const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'db', 'migrations');

await sql`CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
const applied = new Set((await sql`SELECT name FROM schema_migrations`).map((r) => r.name));

for (const file of (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort()) {
  if (applied.has(file)) continue;
  const statements = (await readFile(join(dir, file), 'utf8')).split(';').map((s) => s.trim()).filter(Boolean);
  for (const stmt of statements) await sql.unsafe(stmt);
  await sql`INSERT INTO schema_migrations (name) VALUES (${file})`;
  console.log(`uygulandı: ${file}`);
}
console.log('migration tamam');
await sql.end();
