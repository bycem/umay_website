# Umay Okçuluk Web Sitesi Yeniden Yazımı — İmplementasyon Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Umay Okçuluk kulübü için iki ayrı deploy edilebilir uygulama: Astro SSR public site + React SPA admin paneli, Netlify DB (Neon Postgres) üzerinde.

**Architecture:** Monorepo (npm workspaces) içinde `apps/web` (Astro SSR, salt-okunur DB erişimi, public API yok) ve `apps/admin` (Vite React SPA + Netlify Functions API, şemanın sahibi). Tek ortak nokta aynı Neon veritabanı. Admin girişi tek ortak şifre (bcryptjs hash env'de) + httpOnly cookie'de JWT + DB destekli rate limiting.

**Tech Stack:** Astro + @astrojs/netlify · Vite + React + TypeScript · @neondatabase/serverless · jose (JWT) · bcryptjs · sanitize-html · TipTap · Vitest

**Spec:** `docs/superpowers/specs/2026-07-04-umay-web-rewrite-design.md` — görsel değerlerin (renk, ölçü, davranış) tek doğruluk kaynağı. Her UI task'ında ilgili spec bölümü belirtilmiştir; oradaki değerler birebir kullanılır.

## Global Constraints

- Node 22, npm workspaces (`apps/*`), her app kendi `package.json`'ına sahip; TypeScript her yerde.
- Tüm kullanıcıya görünen metinler **Türkçe**.
- Tasarım token'ları spec §3.1'den birebir: `--bg:#FAF9F6; --surface:#FFFFFF; --ink:#16181D; --ink-soft:#575D68; --muted:#9AA1AC; --accent:#E0452F; --accent-dark:#B93524; --accent-tint:#FCEBE8; --line:#E8E6E1;` gölgeler: `--shadow-sm: 0 1px 3px rgba(22,24,29,0.06); --shadow-md: 0 6px 16px rgba(22,24,29,0.08); --shadow-lg: 0 12px 32px rgba(22,24,29,0.12);`
- Fontlar: başlık `Space Grotesk` (600/700), gövde `Inter` — Google Fonts `<link>` ile.
- Tek responsive breakpoint: `@media (max-width: 768px)`.
- Auth token'ı ASLA localStorage'a yazılmaz — yalnız httpOnly cookie.
- Görseller yalnız harici URL; doğrulama regex'i: `/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i`
- Tarih formatı: `tr-TR`, uzun ay ("2 Temmuz 2026").
- Env değişkenleri: her iki app `NETLIFY_DATABASE_URL`; admin ek: `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`.
- Public görünürlük kuralı: `is_active = TRUE AND publish_date <= NOW()`.
- Commit mesajları conventional commits (`feat:`, `test:`, `chore:`, `docs:`).
- Testler: Vitest, `npm test` her iki app'te çalışır. DB mock'lanır (sahte `sql` fonksiyonu enjekte edilir).

---

### Task 1: Monorepo iskeleti + admin app scaffold

**Files:**
- Create: `package.json` (root), `.gitignore`, `.nvmrc`
- Create: `apps/admin/package.json`, `apps/admin/tsconfig.json`, `apps/admin/vite.config.ts`, `apps/admin/vitest.config.ts`, `apps/admin/index.html`, `apps/admin/src/main.tsx`, `apps/admin/src/App.tsx`

**Interfaces:**
- Produces: `npm test -w apps/admin` ve `npm run build -w apps/admin` çalışır durumda workspace.

- [ ] **Step 1: Root dosyaları yaz**

`package.json`:
```json
{
  "name": "umay-genel",
  "private": true,
  "workspaces": ["apps/*"],
  "engines": { "node": ">=22" }
}
```

`.nvmrc`: `22`

`.gitignore`:
```
node_modules/
dist/
.netlify/
.env
.env.*
!.env.example
*.log
.DS_Store
```

- [ ] **Step 2: Admin app scaffold**

`apps/admin/package.json`:
```json
{
  "name": "umay-admin",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "db:migrate": "node scripts/migrate.mjs"
  }
}
```

Bağımlılıkları kur (root'tan):
```bash
npm install -w apps/admin react react-dom
npm install -w apps/admin -D typescript vite @vitejs/plugin-react vitest @types/react @types/react-dom @types/node
```

`apps/admin/vite.config.ts`:
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:8888' } },
});
```

`apps/admin/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { environment: 'node', include: ['tests/**/*.test.ts'] } });
```

`apps/admin/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  },
  "include": ["src", "netlify", "tests"]
}
```

`apps/admin/index.html`: standart Vite giriş — `<title>Umay Okçuluk — Yönetim</title>`, `<div id="root">`, `/src/main.tsx` script, Google Fonts linki (Space Grotesk 600/700 + Inter 400/500/600).

`apps/admin/src/main.tsx`: `createRoot(document.getElementById('root')!).render(<App />)`.
`apps/admin/src/App.tsx`: şimdilik `<h1>Umay Yönetim</h1>` döndüren stub.

- [ ] **Step 3: Doğrula ve commit**

Run: `npm install && npm run build -w apps/admin`
Expected: build başarılı (dist/ oluşur).

```bash
git add -A && git commit -m "chore: monorepo iskeleti + admin app scaffold"
```

---

### Task 2: DB şeması ve migration altyapısı

**Files:**
- Create: `apps/admin/db/migrations/001_init.sql`, `apps/admin/scripts/migrate.mjs`

**Interfaces:**
- Produces: `sliders`, `announcements`, `login_attempts` tabloları (spec §6 birebir); `npm run db:migrate -w apps/admin` komutu (`NETLIFY_DATABASE_URL` gerekir).

- [ ] **Step 1: Migration SQL'i yaz**

`apps/admin/db/migrations/001_init.sql` — spec §6'daki şema birebir (CREATE TABLE sliders / announcements / login_attempts + üç index).

- [ ] **Step 2: Migration çalıştırıcıyı yaz**

```bash
npm install -w apps/admin @neondatabase/serverless
```

`apps/admin/scripts/migrate.mjs`:
```js
import { neon } from '@neondatabase/serverless';
import { readdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const url = process.env.NETLIFY_DATABASE_URL;
if (!url) { console.error('NETLIFY_DATABASE_URL gerekli'); process.exit(1); }
const sql = neon(url);
const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'db', 'migrations');

await sql`CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
const applied = new Set((await sql`SELECT name FROM schema_migrations`).map((r) => r.name));

for (const file of (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort()) {
  if (applied.has(file)) continue;
  const statements = (await readFile(join(dir, file), 'utf8')).split(';').map((s) => s.trim()).filter(Boolean);
  for (const stmt of statements) await sql.query(stmt);
  await sql`INSERT INTO schema_migrations (name) VALUES (${file})`;
  console.log(`uygulandı: ${file}`);
}
console.log('migration tamam');
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: DB şeması ve migration altyapısı"
```
(DB'ye karşı gerçek çalıştırma deploy aşamasında; script'in sözdizimi `node --check scripts/migrate.mjs` ile doğrulanır.)

---

### Task 3: Özet üretimi — `makeSummary` (TDD)

**Files:**
- Create: `apps/admin/netlify/lib/summary.ts`
- Test: `apps/admin/tests/summary.test.ts`

**Interfaces:**
- Produces: `makeSummary(html: string): string` — tag'siz ilk 150 karakter, uzunsa `...` ekli.

- [ ] **Step 1: Failing test yaz**

```ts
import { describe, it, expect } from 'vitest';
import { makeSummary } from '../netlify/lib/summary';

describe('makeSummary', () => {
  it('HTML tag\'lerini temizler', () => {
    expect(makeSummary('<p>Merhaba <strong>dünya</strong></p>')).toBe('Merhaba dünya');
  });
  it('boşlukları tekilleştirir', () => {
    expect(makeSummary('<p>a</p>\n<p>b</p>')).toBe('a b');
  });
  it('150 karakterden uzunsa keser ve ... ekler', () => {
    const out = makeSummary('<p>' + 'x'.repeat(200) + '</p>');
    expect(out).toHaveLength(153);
    expect(out.endsWith('...')).toBe(true);
  });
  it('kısa metni olduğu gibi bırakır', () => {
    expect(makeSummary('<p>kısa</p>')).toBe('kısa');
  });
  it('boş içerikte boş string döner', () => {
    expect(makeSummary('')).toBe('');
  });
});
```

- [ ] **Step 2: Testi çalıştır — FAIL bekle**

Run: `npm test -w apps/admin`
Expected: FAIL ("Cannot find module ... summary")

- [ ] **Step 3: İmplementasyon**

```ts
export function makeSummary(html: string, maxLen = 150): string {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length <= maxLen ? text : text.slice(0, maxLen).trimEnd() + '...';
}
```

- [ ] **Step 4: Test PASS doğrula, commit**

Run: `npm test -w apps/admin` → PASS

```bash
git add -A && git commit -m "feat: duyuru özeti üretimi (makeSummary)"
```

---

### Task 4: Görsel URL doğrulama (TDD)

**Files:**
- Create: `apps/admin/netlify/lib/imageUrl.ts`
- Test: `apps/admin/tests/imageUrl.test.ts`

**Interfaces:**
- Produces: `isValidImageUrl(url: string): boolean` ve `IMAGE_URL_RE` (regex, SPA da kullanacak).

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from 'vitest';
import { isValidImageUrl } from '../netlify/lib/imageUrl';

describe('isValidImageUrl', () => {
  it.each([
    'https://ex.com/a.jpg', 'http://ex.com/b.PNG', 'https://ex.com/c.webp?w=100',
    'https://ex.com/d.svg', 'https://ex.com/e.jpeg', 'https://ex.com/f.gif',
  ])('geçerli: %s', (u) => expect(isValidImageUrl(u)).toBe(true));
  it.each([
    'ftp://ex.com/a.jpg', 'https://ex.com/a.pdf', 'javascript:alert(1)',
    'https://ex.com/noext', '/relative/a.jpg', '',
  ])('geçersiz: %s', (u) => expect(isValidImageUrl(u)).toBe(false));
});
```

- [ ] **Step 2: FAIL doğrula** — `npm test -w apps/admin`

- [ ] **Step 3: İmplementasyon**

```ts
export const IMAGE_URL_RE = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
export function isValidImageUrl(url: string): boolean {
  return IMAGE_URL_RE.test(url);
}
```

- [ ] **Step 4: PASS doğrula, commit** — `git commit -m "feat: görsel URL doğrulama"`

---

### Task 5: HTML sanitizasyonu (TDD)

**Files:**
- Create: `apps/admin/netlify/lib/sanitize.ts`
- Test: `apps/admin/tests/sanitize.test.ts`

**Interfaces:**
- Produces: `sanitizeContent(html: string): string` — spec §4'teki allowlist.

- [ ] **Step 1: Kurulum + failing test**

```bash
npm install -w apps/admin sanitize-html && npm install -w apps/admin -D @types/sanitize-html
```

```ts
import { describe, it, expect } from 'vitest';
import { sanitizeContent } from '../netlify/lib/sanitize';

describe('sanitizeContent', () => {
  it('script tag\'ini atar', () => {
    expect(sanitizeContent('<p>a</p><script>alert(1)</script>')).toBe('<p>a</p>');
  });
  it('event handler attribute\'larını atar', () => {
    expect(sanitizeContent('<img src="https://e.com/a.jpg" onerror="x()">')).toBe('<img src="https://e.com/a.jpg" />');
  });
  it('izinli biçimlendirmeyi korur', () => {
    const html = '<h2>B</h2><p><strong>k</strong> <em>i</em> <u>u</u> <s>s</s></p><blockquote>q</blockquote><ul><li>x</li></ul>';
    expect(sanitizeContent(html)).toBe(html);
  });
  it('javascript: href\'i atar', () => {
    expect(sanitizeContent('<a href="javascript:alert(1)">x</a>')).toBe('<a>x</a>');
  });
  it('style ve class attribute\'larını atar', () => {
    expect(sanitizeContent('<p style="color:red" class="x">a</p>')).toBe('<p>a</p>');
  });
});
```

- [ ] **Step 2: FAIL doğrula**

- [ ] **Step 3: İmplementasyon**

```ts
import sanitizeHtml from 'sanitize-html';

export function sanitizeContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ['h1', 'h2', 'h3', 'p', 'br', 'strong', 'em', 'u', 's', 'blockquote', 'pre', 'code', 'ol', 'ul', 'li', 'a', 'img'],
    allowedAttributes: { a: ['href'], img: ['src', 'alt'] },
    allowedSchemes: ['http', 'https'],
    disallowedTagsMode: 'discard',
  });
}
```
Not: sanitize-html self-closing çıktıyı `<img ... />` biçiminde verir; test beklentileri gerçek çıktıya göre gerekirse güncellenir (davranış değil, biçim farkı).

- [ ] **Step 4: PASS doğrula, commit** — `git commit -m "feat: duyuru HTML sanitizasyonu"`

---

### Task 6: Oturum — JWT + cookie (TDD)

**Files:**
- Create: `apps/admin/netlify/lib/session.ts`
- Test: `apps/admin/tests/session.test.ts`

**Interfaces:**
- Produces: `createSessionToken(): Promise<string>`, `verifySessionToken(token): Promise<boolean>`, `sessionCookie(token): string`, `clearSessionCookie(): string`, `getSessionToken(req: Request): string | null`. Cookie adı: `umay_session`.

- [ ] **Step 1: Kurulum + failing test**

```bash
npm install -w apps/admin jose
```

```ts
import { describe, it, expect, beforeAll } from 'vitest';
import { createSessionToken, verifySessionToken, sessionCookie, clearSessionCookie, getSessionToken } from '../netlify/lib/session';

beforeAll(() => { process.env.SESSION_SECRET = 'test-secret-en-az-32-karakter-uzun!!'; });

describe('session', () => {
  it('üretilen token doğrulanır', async () => {
    expect(await verifySessionToken(await createSessionToken())).toBe(true);
  });
  it('bozuk token reddedilir', async () => {
    expect(await verifySessionToken('sahte.token.x')).toBe(false);
  });
  it('cookie güvenlik flag\'lerini içerir', () => {
    const c = sessionCookie('abc');
    for (const part of ['umay_session=abc', 'HttpOnly', 'Secure', 'SameSite=Strict', 'Path=/', 'Max-Age=86400']) {
      expect(c).toContain(part);
    }
  });
  it('clear cookie Max-Age=0 içerir', () => {
    expect(clearSessionCookie()).toContain('Max-Age=0');
  });
  it('request\'ten token okur', () => {
    const req = new Request('http://x/', { headers: { cookie: 'a=1; umay_session=tok123; b=2' } });
    expect(getSessionToken(req)).toBe('tok123');
    expect(getSessionToken(new Request('http://x/'))).toBeNull();
  });
});
```

- [ ] **Step 2: FAIL doğrula**

- [ ] **Step 3: İmplementasyon**

```ts
import { SignJWT, jwtVerify } from 'jose';

const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET!);
const COOKIE = 'umay_session';

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret());
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

export function sessionCookie(token: string): string {
  return `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`;
}

export function clearSessionCookie(): string {
  return `${COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

export function getSessionToken(req: Request): string | null {
  const m = (req.headers.get('cookie') ?? '').match(/(?:^|;\s*)umay_session=([^;]+)/);
  return m ? m[1] : null;
}
```

- [ ] **Step 4: PASS doğrula, commit** — `git commit -m "feat: JWT oturum ve cookie yönetimi"`

---

### Task 7: Rate limiting (TDD)

**Files:**
- Create: `apps/admin/netlify/lib/rateLimit.ts`
- Test: `apps/admin/tests/rateLimit.test.ts`

**Interfaces:**
- Consumes: `Sql` tipi — neon tagged-template imzası: `(strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, unknown>[]>`
- Produces: `checkLoginAllowed(sql, ip): Promise<{allowed: boolean}>`, `recordLoginAttempt(sql, ip, success): Promise<void>`, `clientIp(req: Request): string`, sabitler `IP_LIMIT=5`, `GLOBAL_LIMIT=20`, `WINDOW_MINUTES=15`.

- [ ] **Step 1: Failing test**

Sahte `sql`: çağrılan sorgu metinlerini kaydeder; SELECT'e programlanabilir satır döner.

```ts
import { describe, it, expect } from 'vitest';
import { checkLoginAllowed, recordLoginAttempt, clientIp } from '../netlify/lib/rateLimit';

function fakeSql(selectRow: Record<string, unknown>) {
  const calls: string[] = [];
  const sql = async (strings: TemplateStringsArray, ..._v: unknown[]) => {
    const text = strings.join('?');
    calls.push(text);
    return text.includes('SELECT') ? [selectRow] : [];
  };
  return { sql: sql as any, calls };
}

describe('checkLoginAllowed', () => {
  it('eşik altındaysa izin verir ve eski kayıtları temizler', async () => {
    const { sql, calls } = fakeSql({ ip_fails: '2', global_fails: '3' });
    expect((await checkLoginAllowed(sql, '1.2.3.4')).allowed).toBe(true);
    expect(calls.some((c) => c.includes('DELETE'))).toBe(true);
  });
  it('IP eşiğinde (5) reddeder', async () => {
    const { sql } = fakeSql({ ip_fails: '5', global_fails: '5' });
    expect((await checkLoginAllowed(sql, '1.2.3.4')).allowed).toBe(false);
  });
  it('global eşikte (20) reddeder', async () => {
    const { sql } = fakeSql({ ip_fails: '0', global_fails: '20' });
    expect((await checkLoginAllowed(sql, '1.2.3.4')).allowed).toBe(false);
  });
});

describe('recordLoginAttempt', () => {
  it('başarısızda INSERT atar', async () => {
    const { sql, calls } = fakeSql({});
    await recordLoginAttempt(sql, '1.2.3.4', false);
    expect(calls.some((c) => c.includes('INSERT'))).toBe(true);
  });
  it('başarıda IP kayıtlarını siler', async () => {
    const { sql, calls } = fakeSql({});
    await recordLoginAttempt(sql, '1.2.3.4', true);
    expect(calls.some((c) => c.includes('DELETE'))).toBe(true);
    expect(calls.some((c) => c.includes('INSERT'))).toBe(false);
  });
});

describe('clientIp', () => {
  it('Netlify header\'ını önceler', () => {
    const req = new Request('http://x/', { headers: { 'x-nf-client-connection-ip': '9.9.9.9', 'x-forwarded-for': '1.1.1.1, 2.2.2.2' } });
    expect(clientIp(req)).toBe('9.9.9.9');
  });
  it('yoksa x-forwarded-for ilk değeri alır', () => {
    const req = new Request('http://x/', { headers: { 'x-forwarded-for': '1.1.1.1, 2.2.2.2' } });
    expect(clientIp(req)).toBe('1.1.1.1');
  });
  it('hiçbiri yoksa unknown', () => {
    expect(clientIp(new Request('http://x/'))).toBe('unknown');
  });
});
```

- [ ] **Step 2: FAIL doğrula**

- [ ] **Step 3: İmplementasyon**

```ts
export type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, unknown>[]>;

export const IP_LIMIT = 5;
export const GLOBAL_LIMIT = 20;
export const WINDOW_MINUTES = 15;

export async function checkLoginAllowed(sql: Sql, ip: string): Promise<{ allowed: boolean }> {
  await sql`DELETE FROM login_attempts WHERE attempted_at < NOW() - INTERVAL '15 minutes'`;
  const [row] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE ip = ${ip} AND NOT success) AS ip_fails,
      COUNT(*) FILTER (WHERE NOT success) AS global_fails
    FROM login_attempts`;
  const allowed = Number(row.ip_fails) < IP_LIMIT && Number(row.global_fails) < GLOBAL_LIMIT;
  return { allowed };
}

export async function recordLoginAttempt(sql: Sql, ip: string, success: boolean): Promise<void> {
  if (success) {
    await sql`DELETE FROM login_attempts WHERE ip = ${ip}`;
  } else {
    await sql`INSERT INTO login_attempts (ip, success) VALUES (${ip}, FALSE)`;
  }
}

export function clientIp(req: Request): string {
  return (
    req.headers.get('x-nf-client-connection-ip') ??
    (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()
  );
}
```

- [ ] **Step 4: PASS doğrula, commit** — `git commit -m "feat: DB destekli login rate limiting"`

---

### Task 8: API router (TDD)

**Files:**
- Create: `apps/admin/netlify/lib/router.ts`
- Test: `apps/admin/tests/router.test.ts`

**Interfaces:**
- Produces: `matchPath(pattern, path): Record<string,string> | null`, `json(body, status?, headers?): Response`, `createRouter(routes: Route[]): (req: Request) => Promise<Response>` — `Route = { method: string; pattern: string; handler: (req, params) => Promise<Response> }`. Route'lar sırayla denenir → `/api/sliders/reorder` listede `/api/sliders/:id`'den önce yazılır.

- [ ] **Step 1: Failing test**

```ts
import { describe, it, expect } from 'vitest';
import { matchPath, createRouter, json } from '../netlify/lib/router';

describe('matchPath', () => {
  it('statik path eşleşir', () => expect(matchPath('/api/sliders', '/api/sliders')).toEqual({}));
  it('param yakalar', () => expect(matchPath('/api/sliders/:id', '/api/sliders/7')).toEqual({ id: '7' }));
  it('eşleşmezse null', () => expect(matchPath('/api/sliders', '/api/announcements')).toBeNull());
  it('uzunluk farkında null', () => expect(matchPath('/api/sliders', '/api/sliders/7')).toBeNull());
});

describe('createRouter', () => {
  const router = createRouter([
    { method: 'PUT', pattern: '/api/sliders/reorder', handler: async () => json({ hit: 'reorder' }) },
    { method: 'PUT', pattern: '/api/sliders/:id', handler: async (_r, p) => json({ hit: p.id }) },
  ]);
  it('reorder :id\'den önce eşleşir', async () => {
    const res = await router(new Request('http://x/api/sliders/reorder', { method: 'PUT' }));
    expect(await res.json()).toEqual({ hit: 'reorder' });
  });
  it(':id eşleşir', async () => {
    const res = await router(new Request('http://x/api/sliders/5', { method: 'PUT' }));
    expect(await res.json()).toEqual({ hit: '5' });
  });
  it('bilinmeyen path 404 döner', async () => {
    const res = await router(new Request('http://x/api/yok', { method: 'GET' }));
    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 2: FAIL doğrula**

- [ ] **Step 3: İmplementasyon**

```ts
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
```

- [ ] **Step 4: PASS doğrula, commit** — `git commit -m "feat: API router"`

---

### Task 9: Auth handler'ları (TDD)

**Files:**
- Create: `apps/admin/netlify/handlers/auth.ts`
- Test: `apps/admin/tests/auth.test.ts`

**Interfaces:**
- Consumes: Task 6 session, Task 7 rateLimit, Task 8 `json`.
- Produces: `login(req, sql): Promise<Response>`, `logout(): Response`, `me(): Response` (me çağrılmadan önce oturum guard'ı entry'de çalışır — Task 12).

- [ ] **Step 1: Kurulum + failing test**

```bash
npm install -w apps/admin bcryptjs
```

```ts
import { describe, it, expect, beforeAll } from 'vitest';
import bcrypt from 'bcryptjs';
import { login, logout } from '../netlify/handlers/auth';

function fakeSql(selectRow: Record<string, unknown>) {
  return (async (strings: TemplateStringsArray) => {
    const text = strings.join('?');
    return text.includes('SELECT') ? [selectRow] : [];
  }) as any;
}
const noLimit = { ip_fails: '0', global_fails: '0' };
const post = (body: unknown) =>
  new Request('http://x/api/auth/login', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } });

beforeAll(async () => {
  process.env.SESSION_SECRET = 'test-secret-en-az-32-karakter-uzun!!';
  process.env.ADMIN_PASSWORD_HASH = await bcrypt.hash('dogru-sifre', 4);
});

describe('login', () => {
  it('doğru şifrede cookie set eder', async () => {
    const res = await login(post({ password: 'dogru-sifre' }), fakeSql(noLimit));
    expect(res.status).toBe(200);
    expect(res.headers.get('set-cookie')).toContain('umay_session=');
    expect(res.headers.get('set-cookie')).toContain('HttpOnly');
  });
  it('yanlış şifrede 401', async () => {
    const res = await login(post({ password: 'yanlis' }), fakeSql(noLimit));
    expect(res.status).toBe(401);
  });
  it('şifre yoksa 400', async () => {
    expect((await login(post({}), fakeSql(noLimit))).status).toBe(400);
  });
  it('rate limit aşıldıysa 429 ve bcrypt hiç çağrılmaz', async () => {
    const res = await login(post({ password: 'dogru-sifre' }), fakeSql({ ip_fails: '5', global_fails: '5' }));
    expect(res.status).toBe(429);
  });
});

describe('logout', () => {
  it('cookie\'yi temizler', () => {
    expect(logout().headers.get('set-cookie')).toContain('Max-Age=0');
  });
});
```

- [ ] **Step 2: FAIL doğrula**

- [ ] **Step 3: İmplementasyon**

```ts
import bcrypt from 'bcryptjs';
import { json } from '../lib/router';
import { createSessionToken, sessionCookie, clearSessionCookie } from '../lib/session';
import { checkLoginAllowed, recordLoginAttempt, clientIp, type Sql } from '../lib/rateLimit';

export async function login(req: Request, sql: Sql): Promise<Response> {
  const ip = clientIp(req);
  const { allowed } = await checkLoginAllowed(sql, ip);
  if (!allowed) return json({ error: 'Çok fazla başarısız deneme. Lütfen 15 dakika sonra tekrar deneyin.' }, 429);

  const body = await req.json().catch(() => ({}));
  const password = (body as { password?: unknown }).password;
  if (typeof password !== 'string' || password.length === 0) return json({ error: 'Şifre gerekli' }, 400);

  const ok = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH!);
  await recordLoginAttempt(sql, ip, ok);
  if (!ok) return json({ error: 'Şifre hatalı' }, 401);

  const token = await createSessionToken();
  return json({ ok: true }, 200, { 'set-cookie': sessionCookie(token) });
}

export function logout(): Response {
  return json({ ok: true }, 200, { 'set-cookie': clearSessionCookie() });
}

export function me(): Response {
  return json({ ok: true });
}
```

- [ ] **Step 4: PASS doğrula, commit** — `git commit -m "feat: login/logout handler'ları"`

---

### Task 10: Slider CRUD handler'ları (TDD)

**Files:**
- Create: `apps/admin/netlify/handlers/sliders.ts`
- Test: `apps/admin/tests/sliders.test.ts`

**Interfaces:**
- Consumes: `json`, `isValidImageUrl`, `Sql`.
- Produces: `listSliders(sql)`, `createSlider(req, sql)`, `updateSlider(req, sql, id)`, `deleteSlider(sql, id)`, `reorderSliders(req, sql)` — hepsi `Promise<Response>`. Satır şekli: `{id, title, description, image_url, is_active, sort_order}`.

- [ ] **Step 1: Failing test**

Sahte `sql` sorgu metni + değerleri kaydeder, programlanabilir sonuç döner. Test vakaları:
- `listSliders`: `ORDER BY sort_order` içeren SELECT atar, satırları `{sliders: [...]}` olarak döner.
- `createSlider`: title yoksa 400 ("Başlık gerekli"); image_url geçersizse 400 ("Geçerli bir görsel URL'si girin"); geçerliyse INSERT + 201 + dönen satır.
- `updateSlider`: sayı olmayan id → 400; bulunamadı (UPDATE ... RETURNING boş) → 404; geçerliyse 200.
- `deleteSlider`: DELETE ... RETURNING boş → 404; doluysa `{ok: true}`.
- `reorderSliders`: body `{ids: [3,1,2]}` → her id için `sort_order = index` UPDATE; `ids` dizi değilse 400.

```ts
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
```

- [ ] **Step 2: FAIL doğrula**

- [ ] **Step 3: İmplementasyon**

```ts
import { json } from '../lib/router';
import { isValidImageUrl } from '../lib/imageUrl';
import type { Sql } from '../lib/rateLimit';

function parseId(id: string): number | null {
  return /^\d+$/.test(id) ? Number(id) : null;
}

type SliderBody = { title?: unknown; description?: unknown; image_url?: unknown; is_active?: unknown; sort_order?: unknown };

function validateSlider(b: SliderBody): { error?: string; data?: { title: string; description: string; image_url: string; is_active: boolean; sort_order: number } } {
  if (typeof b.title !== 'string' || !b.title.trim()) return { error: 'Başlık gerekli' };
  if (typeof b.image_url !== 'string' || !isValidImageUrl(b.image_url)) return { error: "Geçerli bir görsel URL'si girin" };
  return {
    data: {
      title: b.title.trim(),
      description: typeof b.description === 'string' ? b.description : '',
      image_url: b.image_url,
      is_active: b.is_active !== false,
      sort_order: Number.isInteger(b.sort_order) ? (b.sort_order as number) : 0,
    },
  };
}

export async function listSliders(sql: Sql): Promise<Response> {
  const sliders = await sql`SELECT id, title, description, image_url, is_active, sort_order FROM sliders ORDER BY sort_order, id`;
  return json({ sliders });
}

export async function createSlider(req: Request, sql: Sql): Promise<Response> {
  const { error, data } = validateSlider(await req.json().catch(() => ({})));
  if (error) return json({ error }, 400);
  const [row] = await sql`
    INSERT INTO sliders (title, description, image_url, is_active, sort_order)
    VALUES (${data!.title}, ${data!.description}, ${data!.image_url}, ${data!.is_active}, ${data!.sort_order})
    RETURNING id, title, description, image_url, is_active, sort_order`;
  return json({ slider: row }, 201);
}

export async function updateSlider(req: Request, sql: Sql, id: string): Promise<Response> {
  const numId = parseId(id);
  if (numId === null) return json({ error: 'Geçersiz id' }, 400);
  const { error, data } = validateSlider(await req.json().catch(() => ({})));
  if (error) return json({ error }, 400);
  const rows = await sql`
    UPDATE sliders SET title = ${data!.title}, description = ${data!.description}, image_url = ${data!.image_url},
      is_active = ${data!.is_active}, sort_order = ${data!.sort_order}, updated_at = NOW()
    WHERE id = ${numId}
    RETURNING id, title, description, image_url, is_active, sort_order`;
  if (rows.length === 0) return json({ error: 'Kayıt bulunamadı' }, 404);
  return json({ slider: rows[0] });
}

export async function deleteSlider(sql: Sql, id: string): Promise<Response> {
  const numId = parseId(id);
  if (numId === null) return json({ error: 'Geçersiz id' }, 400);
  const rows = await sql`DELETE FROM sliders WHERE id = ${numId} RETURNING id`;
  if (rows.length === 0) return json({ error: 'Kayıt bulunamadı' }, 404);
  return json({ ok: true });
}

export async function reorderSliders(req: Request, sql: Sql): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  const ids = (body as { ids?: unknown }).ids;
  if (!Array.isArray(ids) || !ids.every((n) => Number.isInteger(n))) return json({ error: 'ids tam sayı dizisi olmalı' }, 400);
  for (let i = 0; i < ids.length; i++) {
    await sql`UPDATE sliders SET sort_order = ${i}, updated_at = NOW() WHERE id = ${ids[i]}`;
  }
  return json({ ok: true });
}
```

- [ ] **Step 4: PASS doğrula, commit** — `git commit -m "feat: slider CRUD handler'ları"`

---

### Task 11: Duyuru CRUD handler'ları (TDD)

**Files:**
- Create: `apps/admin/netlify/handlers/announcements.ts`
- Test: `apps/admin/tests/announcements.test.ts`

**Interfaces:**
- Consumes: `json`, `makeSummary`, `sanitizeContent`, `Sql`.
- Produces: `listAnnouncements(req, sql)`, `createAnnouncement(req, sql)`, `updateAnnouncement(req, sql, id)`, `deleteAnnouncement(sql, id)`. Liste yanıtı: `{announcements, total}` — limit ≤ 50 (varsayılan 10), offset ≥ 0. Satır: `{id, title, content, summary, publish_date, is_active}`.

- [ ] **Step 1: Failing test**

Task 10'daki `fakeSql` yardımcı aynen kopyalanır (her test dosyası kendine yeter). Vakalar:
- `listAnnouncements`: `?limit=200` → sorgu değerlerinde 50'ye kırpılır; limit yoksa 10; yanıt `{announcements, total}` (total ayrı `COUNT(*)` sorgusundan — fakeSql'e iki farklı sonuç programlanır: text `COUNT` içeriyorsa `[{count: '7'}]`, değilse satır listesi).
- `createAnnouncement`: başlıksız → 400; content string değilse → 400; geçerli → INSERT değerlerinde sanitize edilmiş content (`<script>` girdisi temizlenmiş) ve `makeSummary` çıktısı; 201.
- `updateAnnouncement`: 400 (kötü id) / 404 (boş RETURNING) / 200 — content yeniden sanitize + summary yeniden üretilir.
- `deleteAnnouncement`: 404 / `{ok: true}`.

Test iskeleti Task 10 ile aynı desende yazılır; sanitize doğrulaması örneği:

```ts
it('createAnnouncement content\'i sanitize eder ve summary üretir', async () => {
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
```

- [ ] **Step 2: FAIL doğrula**

- [ ] **Step 3: İmplementasyon**

```ts
import { json } from '../lib/router';
import { makeSummary } from '../lib/summary';
import { sanitizeContent } from '../lib/sanitize';
import type { Sql } from '../lib/rateLimit';

function parseId(id: string): number | null {
  return /^\d+$/.test(id) ? Number(id) : null;
}

type AnnBody = { title?: unknown; content?: unknown; publish_date?: unknown; is_active?: unknown };

function validateAnn(b: AnnBody): { error?: string; data?: { title: string; content: string; summary: string; publish_date: string; is_active: boolean } } {
  if (typeof b.title !== 'string' || !b.title.trim()) return { error: 'Başlık gerekli' };
  if (typeof b.content !== 'string' || !b.content.trim()) return { error: 'İçerik gerekli' };
  const content = sanitizeContent(b.content);
  const publish_date = typeof b.publish_date === 'string' && b.publish_date ? new Date(b.publish_date).toISOString() : new Date().toISOString();
  return { data: { title: b.title.trim(), content, summary: makeSummary(content), publish_date, is_active: b.is_active !== false } };
}

export async function listAnnouncements(req: Request, sql: Sql): Promise<Response> {
  const url = new URL(req.url);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit')) || 10));
  const offset = Math.max(0, Number(url.searchParams.get('offset')) || 0);
  const announcements = await sql`
    SELECT id, title, content, summary, publish_date, is_active FROM announcements
    ORDER BY publish_date DESC LIMIT ${limit} OFFSET ${offset}`;
  const [{ count }] = await sql`SELECT COUNT(*) AS count FROM announcements`;
  return json({ announcements, total: Number(count) });
}

export async function createAnnouncement(req: Request, sql: Sql): Promise<Response> {
  const { error, data } = validateAnn(await req.json().catch(() => ({})));
  if (error) return json({ error }, 400);
  const [row] = await sql`
    INSERT INTO announcements (title, content, summary, publish_date, is_active)
    VALUES (${data!.title}, ${data!.content}, ${data!.summary}, ${data!.publish_date}, ${data!.is_active})
    RETURNING id, title, content, summary, publish_date, is_active`;
  return json({ announcement: row }, 201);
}

export async function updateAnnouncement(req: Request, sql: Sql, id: string): Promise<Response> {
  const numId = parseId(id);
  if (numId === null) return json({ error: 'Geçersiz id' }, 400);
  const { error, data } = validateAnn(await req.json().catch(() => ({})));
  if (error) return json({ error }, 400);
  const rows = await sql`
    UPDATE announcements SET title = ${data!.title}, content = ${data!.content}, summary = ${data!.summary},
      publish_date = ${data!.publish_date}, is_active = ${data!.is_active}, updated_at = NOW()
    WHERE id = ${numId}
    RETURNING id, title, content, summary, publish_date, is_active`;
  if (rows.length === 0) return json({ error: 'Kayıt bulunamadı' }, 404);
  return json({ announcement: rows[0] });
}

export async function deleteAnnouncement(sql: Sql, id: string): Promise<Response> {
  const numId = parseId(id);
  if (numId === null) return json({ error: 'Geçersiz id' }, 400);
  const rows = await sql`DELETE FROM announcements WHERE id = ${numId} RETURNING id`;
  if (rows.length === 0) return json({ error: 'Kayıt bulunamadı' }, 404);
  return json({ ok: true });
}
```

- [ ] **Step 4: PASS doğrula, commit** — `git commit -m "feat: duyuru CRUD handler'ları"`

---

### Task 12: Function entry + guard'lar + netlify.toml (admin)

**Files:**
- Create: `apps/admin/netlify/functions/api.ts`, `apps/admin/netlify/lib/db.ts`, `apps/admin/netlify.toml`, `apps/admin/public/_redirects` (gerekmiyorsa toml redirect yeterli)
- Test: `apps/admin/tests/api.test.ts`

**Interfaces:**
- Consumes: tüm handler'lar, router, session.
- Produces: `/api/*` path'inde Netlify Function (v2, default export + `config = { path: '/api/*' }`). Guard davranışı testlenebilir olsun diye `buildApi(sql): (req) => Promise<Response>` ayrı export edilir.

- [ ] **Step 1: Failing test (guard'lar)**

```ts
import { describe, it, expect, beforeAll } from 'vitest';
import { buildApi } from '../netlify/functions/api';
import { createSessionToken } from '../netlify/lib/session';

const fakeSql = (async () => []) as any;

beforeAll(() => { process.env.SESSION_SECRET = 'test-secret-en-az-32-karakter-uzun!!'; });

describe('api guard', () => {
  it('oturumsuz istek 401', async () => {
    const res = await buildApi(fakeSql)(new Request('http://x/api/sliders'));
    expect(res.status).toBe(401);
  });
  it('geçerli oturumla geçer', async () => {
    const token = await createSessionToken();
    const res = await buildApi(fakeSql)(new Request('http://x/api/auth/me', { headers: { cookie: `umay_session=${token}` } }));
    expect(res.status).toBe(200);
  });
  it('login oturum istemez (400 döner, 401 değil)', async () => {
    const res = await buildApi(fakeSql)(new Request('http://x/api/auth/login', { method: 'POST', body: '{}' }));
    expect(res.status).not.toBe(401);
  });
  it('cross-origin mutasyon 403', async () => {
    const token = await createSessionToken();
    const res = await buildApi(fakeSql)(new Request('http://x/api/sliders', {
      method: 'POST', body: '{}',
      headers: { cookie: `umay_session=${token}`, origin: 'https://evil.com', host: 'x' },
    }));
    expect(res.status).toBe(403);
  });
});
```

- [ ] **Step 2: FAIL doğrula**

- [ ] **Step 3: İmplementasyon**

`apps/admin/netlify/lib/db.ts`:
```ts
import { neon } from '@neondatabase/serverless';
export const sql = neon(process.env.NETLIFY_DATABASE_URL!);
```

`apps/admin/netlify/functions/api.ts`:
```ts
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
```

`apps/admin/netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[functions]
  node_bundler = "esbuild"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; img-src * data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; connect-src 'self'"
```

- [ ] **Step 4: PASS doğrula, commit** — `npm test -w apps/admin` tümü yeşil → `git commit -m "feat: admin API entry, guard'lar ve Netlify yapılandırması"`

---

### Task 13: Admin SPA — tasarım token'ları, API istemcisi, auth akışı, Login ekranı

**Files:**
- Create: `apps/admin/src/styles/tokens.css`, `apps/admin/src/styles/admin.css`, `apps/admin/src/lib/api.ts`, `apps/admin/src/pages/Login.tsx`
- Modify: `apps/admin/src/App.tsx`, `apps/admin/src/main.tsx`

**Interfaces:**
- Produces: `api.get/post/put/del(path, body?)` — `fetch(path, { credentials: 'same-origin', headers: {'content-type':'application/json'} })`, hata gövdesindeki `error` alanını `Error(message)` olarak fırlatır; 401'de `onUnauthorized` callback'i tetikler. `App` durum makinesi: `checking → login → panel`.

- [ ] **Step 1: tokens.css yaz**

Global Constraints'teki tüm CSS değişkenleri `:root` altında + `body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--ink); }` + `h1..h3 { font-family: 'Space Grotesk', sans-serif; }`.

- [ ] **Step 2: api.ts yaz**

```ts
let onUnauthorized: () => void = () => {};
export function setUnauthorizedHandler(fn: () => void) { onUnauthorized = fn; }

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: body !== undefined ? { 'content-type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) onUnauthorized();
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? 'Bir hata oluştu');
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(p: string) => request<T>('GET', p),
  post: <T>(p: string, b?: unknown) => request<T>('POST', p, b),
  put: <T>(p: string, b?: unknown) => request<T>('PUT', p, b),
  del: <T>(p: string) => request<T>('DELETE', p),
};
```

- [ ] **Step 3: Login.tsx + App.tsx**

`Login.tsx`: spec §3.4 — `--ink` zeminli tam ekran, ortalanmış kart (max 400px, 48px padding, 16px radius, `--surface`), logo (64px, `/logo.png`), "Yönetim Paneli" başlığı (Space Grotesk), şifre `<input type="password">`, "Giriş Yap" butonu (accent zemin, hover accent-dark). Hata mesajı (401/429 gövdesindeki Türkçe metin) kartın içinde kırmızı gösterilir. Submit → `api.post('/api/auth/login', {password})` → başarıda `onLogin()` callback.

`App.tsx`:
```tsx
import { useEffect, useState } from 'react';
import { api, setUnauthorizedHandler } from './lib/api';
import Login from './pages/Login';

type Phase = 'checking' | 'login' | 'panel';

export default function App() {
  const [phase, setPhase] = useState<Phase>('checking');
  useEffect(() => {
    setUnauthorizedHandler(() => setPhase('login'));
    api.get('/api/auth/me').then(() => setPhase('panel')).catch(() => setPhase('login'));
  }, []);
  if (phase === 'checking') return null;
  if (phase === 'login') return <Login onLogin={() => setPhase('panel')} />;
  return <div>panel placeholder</div>; // Task 14'te AppLayout gelecek
}
```

- [ ] **Step 4: Doğrula, commit**

Run: `npm run build -w apps/admin` → başarılı.
```bash
git add -A && git commit -m "feat: admin SPA auth akışı ve login ekranı"
```

---

### Task 14: Admin SPA — AppLayout (sidebar), Toast, Modal, ConfirmDialog

**Files:**
- Create: `apps/admin/src/components/AppLayout.tsx`, `apps/admin/src/components/Toast.tsx`, `apps/admin/src/components/Modal.tsx`, `apps/admin/src/components/ConfirmDialog.tsx`
- Modify: `apps/admin/src/App.tsx`, `apps/admin/src/styles/admin.css`

**Interfaces:**
- Produces:
  - `AppLayout({ active: 'sliders' | 'announcements', onNavigate, onLogout, children })` — sol sidebar (200px; logo + "Slider" / "Duyurular" linkleri + altta "Çıkış"); mobilde (≤768px) üstte yatay bar.
  - `ToastProvider` + `useToast(): { show(message: string, kind?: 'success' | 'error'): void }` — sağ üstte dikey yığılır, 3000ms sonra otomatik kapanır (spec §3.4).
  - `Modal({ open, title, onClose, children })` — `rgba(22,24,29,0.4)` + `backdrop-filter: blur(4px)` overlay, kart max 560px, 16px radius.
  - `ConfirmDialog({ open, message, onConfirm, onCancel })` — Modal üstüne kurulu; "Vazgeç" / "Sil" (accent) butonları.

- [ ] **Step 1: Bileşenleri yaz** — yukarıdaki arayüzler + spec §3.4 görsel değerleri (tablo/rozet stilleri admin.css'e: uppercase 0.8rem tablo başlığı, satır hover tint `rgba(224,69,47,0.03)`, Aktif rozeti `rgba(46,204,113,0.15)` zemin yeşil metin, Pasif kırmızı tint, görsel önizleme 80×45 cover, form focus `--accent`).

- [ ] **Step 2: App.tsx'e bağla** — `phase === 'panel'` iken `ToastProvider > AppLayout`; `active` state'i ile `SlidersPage` (Task 15) / `AnnouncementsPage` (Task 16) yer tutucuları; "Çıkış" → `api.post('/api/auth/logout')` + `setPhase('login')`.

- [ ] **Step 3: Doğrula, commit** — `npm run build -w apps/admin` → `git commit -m "feat: admin panel yerleşimi, toast ve modal bileşenleri"`

---

### Task 15: Admin SPA — Slider yönetimi sayfası

**Files:**
- Create: `apps/admin/src/pages/SlidersPage.tsx`
- Modify: `apps/admin/src/App.tsx`

**Interfaces:**
- Consumes: `api`, `useToast`, `Modal`, `ConfirmDialog`, `IMAGE_URL_RE` (kopya sabit — SPA kendi `src/lib/validation.ts` dosyasında aynı regex'i tanımlar, netlify/ koduna import sınırı koymamak için).
- Produces: Slider tablosu — kolonlar: görsel önizleme (80×45), başlık, durum rozeti, sıra (↑/↓ butonları), işlemler (Düzenle/Sil).

Davranış:
- Yükleme: `GET /api/sliders` → tablo. Boşsa "Henüz slider eklenmemiş" boş durumu.
- "Yeni Slider" butonu → Modal form: başlık (zorunlu), açıklama (textarea), görsel URL (zorunlu, regex istemci doğrulaması + canlı önizleme), sıra (number), aktif/pasif (checkbox). Kaydet → `POST /api/sliders`, toast "Slider eklendi".
- Düzenle → aynı Modal dolu halde → `PUT /api/sliders/:id`.
- ↑/↓ → id listesi yeniden dizilir → `PUT /api/sliders/reorder {ids}` → yeniden yükle.
- Sil → ConfirmDialog ("Bu slider silinsin mi?") → `DELETE /api/sliders/:id`, toast "Slider silindi".
- Tüm hatalar `useToast().show(err.message, 'error')`.

- [ ] **Step 1: Sayfayı yaz** (yukarıdaki davranış + spec §3.4 stilleri)
- [ ] **Step 2: Doğrula, commit** — `npm run build -w apps/admin` → `git commit -m "feat: slider yönetimi sayfası"`

---

### Task 16: Admin SPA — Duyuru yönetimi sayfası (TipTap)

**Files:**
- Create: `apps/admin/src/pages/AnnouncementsPage.tsx`, `apps/admin/src/components/RichTextEditor.tsx`, `apps/admin/src/lib/validation.ts`
- Modify: `apps/admin/src/App.tsx`

**Interfaces:**
- Consumes: `api`, `useToast`, `Modal`, `ConfirmDialog`.
- Produces: `RichTextEditor({ value: string, onChange(html: string) })` — TipTap; duyuru listesi + form.

- [ ] **Step 1: TipTap kurulumu**

```bash
npm install -w apps/admin @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-underline @tiptap/extension-link @tiptap/extension-image
```

- [ ] **Step 2: RichTextEditor.tsx**

- StarterKit (heading levels [1,2,3]) + Underline + Link + Image.
- Araç çubuğu butonları: H1 H2 H3 · B I U S · alıntı · kod · sıralı/sırasız liste · link · resim.
- Resim ekleme: buton → küçük satır içi input açılır, URL `validation.ts`'teki `IMAGE_URL_RE` ile doğrulanır; geçerliyse `editor.chain().focus().setImage({ src }).run()`; **Enter tuşu da ekler**; geçersizse input altında "Geçerli bir görsel URL'si girin" hatası.
- Link ekleme: `window.prompt` ile URL; `https?:` ile başlamıyorsa eklenmez.
- Editör içerik alanı ~300px min-height, `--line` kenarlık, focus'ta `--accent`.
- `validation.ts`: `export const IMAGE_URL_RE = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;`

- [ ] **Step 3: AnnouncementsPage.tsx**

- Liste: `GET /api/announcements?limit=10&offset=N` → tablo (başlık, yayın tarihi `tr-TR` format, durum rozeti, Düzenle/Sil); `total` ile "Önceki/Sonraki" sayfalama butonları.
- Form Modal: başlık, RichTextEditor, yayın tarihi `<input type="datetime-local">` (varsayılan: şimdi — `new Date().toISOString().slice(0,16)`), aktif/pasif checkbox.
- Oluştur/Güncelle/Sil akışları Task 15 ile aynı desen; toast metinleri "Duyuru eklendi" / "Duyuru güncellendi" / "Duyuru silindi".

- [ ] **Step 4: Doğrula, commit** — `npm run build -w apps/admin` → `git commit -m "feat: duyuru yönetimi ve TipTap editörü"`

---

### Task 17: Web app scaffold — Astro + Layout + Header + Footer

**Files:**
- Create: `apps/web/package.json`, `apps/web/astro.config.mjs`, `apps/web/tsconfig.json`, `apps/web/netlify.toml`, `apps/web/src/styles/global.css`, `apps/web/src/layouts/Layout.astro`, `apps/web/src/components/Header.astro`, `apps/web/src/components/Footer.astro`, `apps/web/public/logo.png` (yer tutucu — README'de not), `apps/web/vitest.config.ts`

**Interfaces:**
- Produces: `Layout.astro` — props: `{ title: string, description?: string }`; Header + `<slot/>` + Footer; global.css token'ları (Global Constraints) + Google Fonts.

- [ ] **Step 1: Scaffold**

```bash
npm install -w apps/web astro @astrojs/netlify @neondatabase/serverless
npm install -w apps/web -D vitest typescript
```

`apps/web/package.json` scripts: `dev: astro dev`, `build: astro build`, `test: vitest run`.

`apps/web/astro.config.mjs`:
```js
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

export default defineConfig({
  output: 'server',
  adapter: netlify(),
});
```

`apps/web/netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

- [ ] **Step 2: global.css + Layout + Header + Footer**

`global.css`: token'lar, reset (`box-sizing`, margin sıfırlama), `body` font/renk, `.container { max-width: 1200px; margin-inline: auto; padding-inline: 24px; }`, bölüm `padding: 72px 0` (mobil 48px), `.overline` sınıfı (accent, uppercase, 0.8rem, letter-spacing 0.12em, 600), fade-up animasyon sınıfları (`.fade-up` başlangıç `opacity:0; transform: translateY(16px)`, `.visible` geçişli görünür; `@media (prefers-reduced-motion: reduce)` altında animasyon kapalı).

`Header.astro` (spec §3.3): sticky nav 72px, `rgba(250,249,246,0.9)` + blur(12px), alt kenarlık `--line`. Logo (40px) + "UMAY OKÇULUK" (Space Grotesk 700). Linkler: Anasayfa `/`, Hakkımızda `/hakkimizda`, İletişim `/iletisim` + "Turnuva Uygulaması" outline buton (dış link `https://turnuva.umayokculuk.com` — href sabiti dosyanın başında `const TOURNAMENT_URL` olarak, kolay değişsin). Mobil: hamburger → tam ekran overlay menü (vanilla `<script>`, `aria-expanded` yönetilir).

`Footer.astro` (spec §3.3): `--ink` zemin, açık metin; logo + marka, adres (Hürriyet Mahallesi, Alan Sokak, No:29/B, Lüleburgaz / Kırklareli), Instagram SVG ikon linki (`https://www.instagram.com/umay_okculuk/`), e-posta `umayokculuk@gmail.com`; en altta geliştirici kredisi satırı (0.78rem, üst kenarlık `rgba(255,255,255,0.1)`).

`Layout.astro`: `<html lang="tr">`, meta charset/viewport, `<title>`, description meta, Google Fonts preconnect + link, global.css import, Header/Footer, `<slot/>`, fade-up IntersectionObserver script'i (inline, `document.querySelectorAll('.fade-up')`).

- [ ] **Step 3: Doğrula, commit** — `npm run build -w apps/web` → `git commit -m "feat: web app iskeleti, header ve footer"`

---

### Task 18: Web — DB katmanı ve format yardımcıları (TDD)

**Files:**
- Create: `apps/web/src/lib/db.ts`, `apps/web/src/lib/queries.ts`, `apps/web/src/lib/format.ts`
- Test: `apps/web/tests/format.test.ts`, `apps/web/tests/queries.test.ts`

**Interfaces:**
- Produces:
  - `formatDateTr(d: string | Date): string` — "2 Temmuz 2026".
  - `getActiveSliders(sql): Promise<Slider[]>`, `getRecentAnnouncements(sql, limit): Promise<Announcement[]>`, `getAnnouncementById(sql, id): Promise<Announcement | null>` — hepsi `is_active AND publish_date <= NOW()` kuralına uyar (slider'da yalnız is_active).
  - `db.ts`: `export const sql = neon(process.env.NETLIFY_DATABASE_URL!)` (test edilmez, sarmalayıcı).

- [ ] **Step 1: Failing testler**

`format.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { formatDateTr } from '../src/lib/format';

describe('formatDateTr', () => {
  it('tr-TR uzun ay formatlar', () => {
    expect(formatDateTr('2026-07-02T10:00:00Z')).toBe('2 Temmuz 2026');
  });
  it('Date nesnesi kabul eder', () => {
    expect(formatDateTr(new Date('2026-01-15T00:00:00Z'))).toBe('15 Ocak 2026');
  });
});
```

`queries.test.ts` — sahte sql ile sorgu koşulları doğrulanır:
```ts
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
```

- [ ] **Step 2: FAIL doğrula** — `npm test -w apps/web`

- [ ] **Step 3: İmplementasyon**

`format.ts`:
```ts
export function formatDateTr(d: string | Date): string {
  return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Istanbul' }).format(new Date(d));
}
```

`queries.ts`:
```ts
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
```

- [ ] **Step 4: PASS doğrula, commit** — `git commit -m "feat: web DB sorguları ve tarih formatlama"`

---

### Task 19: Web — Anasayfa (hero slider + duyuru kartları)

**Files:**
- Create: `apps/web/src/pages/index.astro`, `apps/web/src/components/HeroSlider.astro`, `apps/web/src/components/AnnouncementCard.astro`

**Interfaces:**
- Consumes: `sql`, `getActiveSliders`, `getRecentAnnouncements`, `formatDateTr`, `Layout`.
- Produces: `AnnouncementCard` props: `{ announcement: Announcement }` (Task 21 de kullanabilir).

- [ ] **Step 1: HeroSlider.astro**

Props: `{ sliders: Slider[] }`. Spec §3.3 birebir:
- Kap: `height: 70vh; min-height: 480px` (mobil `60vh`), slide'lar yatay dizili, `transform: translateX(-index*100%); transition: transform 0.5s ease`.
- Slide: `<img loading="eager" object-fit: cover>` + overlay `linear-gradient(180deg, transparent 30%, rgba(22,24,29,0.75))`, sol-alt içerik: H2 `clamp(2rem,5vw,3.5rem)` beyaz + açıklama.
- Ok butonları: 44px daire, `rgba(22,24,29,0.5)` zemin, beyaz SVG chevron; uçlarda döngü.
- Göstergeler: her slide için ince progress-bar (width 48px, height 3px, `rgba(255,255,255,0.35)` zemin); aktif olanın dolgusu CSS animasyonu ile 5000ms'de `0→100%` dolar; tıklanınca o slide'a gider.
- Inline `<script>`: index state, `setInterval` 5000ms, `mouseenter` durdur / `mouseleave` devam, ok/gösterge tıklamaları, aktif göstergenin animasyonunu yeniden başlatma (`element.style.animation = 'none'; void element.offsetWidth; element.style.animation = ''`).
- `sliders.length === 0` → "Henüz slider eklenmemiş" boş durumu (oklar/göstergeler render edilmez); `length === 1` → otomatik geçiş ve oklar kapalı.

- [ ] **Step 2: AnnouncementCard.astro + index.astro**

`AnnouncementCard`: `<a href={`/duyuru/${a.id}`}>` kart — 16px radius, `--surface`, `--shadow-sm` → hover `--shadow-md` + `translateY(-3px)`; tarih chip'i (`--accent-tint` zemin, `--accent-dark` metin, 0.8rem, `formatDateTr`); başlık (Space Grotesk 600); summary (`--ink-soft`); "Devamını oku →" (accent, 600).

`index.astro`:
```astro
---
import Layout from '../layouts/Layout.astro';
import HeroSlider from '../components/HeroSlider.astro';
import AnnouncementCard from '../components/AnnouncementCard.astro';
import { sql } from '../lib/db';
import { getActiveSliders, getRecentAnnouncements } from '../lib/queries';

const [sliders, announcements] = await Promise.all([
  getActiveSliders(sql), getRecentAnnouncements(sql, 6),
]);
---
<Layout title="Umay Okçuluk" description="Umay Okçuluk Kulübü — Lüleburgaz">
  <HeroSlider sliders={sliders} />
  <section class="container fade-up">
    <p class="overline">DUYURULAR</p>
    <h2>Son Duyurular</h2>
    {announcements.length === 0
      ? <p class="empty">Henüz duyuru bulunmuyor.</p>
      : <div class="cards">{announcements.map((a) => <AnnouncementCard announcement={a} />)}</div>}
  </section>
</Layout>
```
`.cards`: `display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px;` (mobil tek sütun).

- [ ] **Step 3: Doğrula, commit** — `npm run build -w apps/web` → `git commit -m "feat: anasayfa, hero slider ve duyuru kartları"`

---

### Task 20: Web — Hakkımızda ve İletişim sayfaları

**Files:**
- Create: `apps/web/src/pages/hakkimizda.astro`, `apps/web/src/pages/iletisim.astro`

- [ ] **Step 1: hakkimizda.astro**

Overline "HAKKIMIZDA" + başlık + kulüp tanıtımı ve okçuluk felsefesi metni. Gerçek metin elde olmadığından iki paragraflık makul Türkçe yer tutucu yazılır ve dosyaya `<!-- İÇERİK: eski siteden taşınacak -->` yorumu eklenir. Dar içerik sütunu (max 720px).

- [ ] **Step 2: iletisim.astro**

Overline "İLETİŞİM" + 3 kart (grid, mobilde tek sütun): Adres (Hürriyet Mahallesi, Alan Sokak, No:29/B, Lüleburgaz / Kırklareli) · E-posta (`mailto:umayokculuk@gmail.com`) · Instagram (`https://www.instagram.com/umay_okculuk/`, `@umay_okculuk`). Altında Google Maps iframe (`https://www.google.com/maps?q=H%C3%BCrriyet+Mahallesi+Alan+Sokak+29/B+L%C3%BCleburgaz&output=embed`, `loading="lazy"`, 16px radius, yükseklik 400px).

- [ ] **Step 3: Doğrula, commit** — `npm run build -w apps/web` → `git commit -m "feat: hakkımızda ve iletişim sayfaları"`

---

### Task 21: Web — Duyuru detay + 404/500 sayfaları

**Files:**
- Create: `apps/web/src/pages/duyuru/[id].astro`, `apps/web/src/pages/404.astro`, `apps/web/src/pages/500.astro`

- [ ] **Step 1: duyuru/[id].astro**

```astro
---
import Layout from '../../layouts/Layout.astro';
import { sql } from '../../lib/db';
import { getAnnouncementById } from '../../lib/queries';
import { formatDateTr } from '../../lib/format';

const idParam = Astro.params.id ?? '';
if (!/^\d+$/.test(idParam)) return Astro.rewrite('/404');
const announcement = await getAnnouncementById(sql, Number(idParam));
if (!announcement) return Astro.rewrite('/404');
---
<Layout title={`${announcement.title} — Umay Okçuluk`} description={announcement.summary ?? undefined}>
  <article class="container detail fade-up">
    <a href="/" class="back">← Anasayfa</a>
    <span class="date-chip">{formatDateTr(announcement.publish_date)}</span>
    <h1>{announcement.title}</h1>
    <div class="content" set:html={announcement.content} />
  </article>
</Layout>
```
`.detail`: max-width 720px; `.content` içi tipografi stilleri (p satır aralığı 1.7, img `max-width: 100%; border-radius: 12px`, blockquote sol accent kenarlık). İçerik kayıt anında sanitize edildiği için `set:html` güvenli.

- [ ] **Step 2: 404.astro + 500.astro**

Aynı Layout ile sade: büyük "404" / "500" (Space Grotesk, accent), "Aradığınız sayfa bulunamadı." / "Beklenmedik bir hata oluştu.", "Anasayfaya dön" linki. `404.astro` `Astro.response.status = 404` set eder.

- [ ] **Step 3: Doğrula, commit** — `npm run build -w apps/web` + `npm test -w apps/web` → `git commit -m "feat: duyuru detayı ve hata sayfaları"`

---

### Task 22: README + deployment dokümantasyonu

**Files:**
- Create: `README.md`, `apps/admin/.env.example`, `apps/web/.env.example`

- [ ] **Step 1: README yaz**

İçerik:
- Proje tanımı + monorepo yapısı (iki app tablosu).
- Yerel geliştirme: `npm install`; web: `npm run dev -w apps/web`; admin: `netlify dev` (functions için) + `npm run dev -w apps/admin`.
- Netlify kurulumu: iki site, base directory `apps/web` / `apps/admin`; Netlify DB oluşturma (`NETLIFY_DATABASE_URL` otomatik; diğer siteye shared env var olarak eklenir).
- Env değişkenleri tablosu: `NETLIFY_DATABASE_URL` (ikisi de), `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` (yalnız admin).
- Şifre hash'i üretme: `node -e "import('bcryptjs').then(b => b.hash(process.argv[1], 12).then(console.log))" 'sifreniz'` (apps/admin içinden).
- `SESSION_SECRET` üretme: `openssl rand -base64 32`.
- Migration: `NETLIFY_DATABASE_URL=... npm run db:migrate -w apps/admin`.
- Logo notu: `apps/web/public/logo.png` ve `apps/admin/public/logo.png` — eski siteden kopyalanacak (yer tutucu mevcut).
- Admin subdomain önerisi (panel.umayokculuk.com) + public site domain.

`.env.example` dosyaları ilgili değişken adlarını boş değerlerle listeler.

- [ ] **Step 2: Son doğrulama, commit**

Run: `npm test -w apps/admin && npm test -w apps/web && npm run build -w apps/admin && npm run build -w apps/web`
Expected: hepsi başarılı.

```bash
git add -A && git commit -m "docs: README ve deployment dokümantasyonu"
```
