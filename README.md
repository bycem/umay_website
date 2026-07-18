# Umay Okçuluk — Monorepo

Umay Okçuluk kulübü için genel web sitesi ve yönetim panelini içeren monorepo. İki bağımsız uygulama, ortak bir Postgres veritabanını (Supabase ya da başka herhangi bir Postgres) paylaşır. DB istemcisi olarak [`postgres`](https://github.com/porsager/postgres) (postgres.js) kullanılır.

## Proje yapısı

| Paket | Açıklama | Deploy |
|---|---|---|
| `apps/web` | Herkese açık site (Astro, SSR) — duyurular, hero slider, kulüp bilgileri | Ayrı Netlify sitesi |
| `apps/admin` | Yönetim paneli (Vite + React SPA) + Netlify Functions API — slider ve duyuru yönetimi, login | Ayrı Netlify sitesi |

Her iki uygulama da workspace olarak `apps/*` altında tanımlıdır (bkz. kök `package.json`). Node `>=22` gerekir.

## Yerel geliştirme

Kök dizinde bağımlılıkları kurun:

```bash
npm install
```

### Ortam değişkeni

Her iki app da Postgres bağlantısı için `NETLIFY_DATABASE_URL` bekler. Yerelde Supabase kullanıyorsan pooler connection string'ini kullan:

```bash
export NETLIFY_DATABASE_URL='postgresql://postgres.<PROJECT-REF>:<PASSWORD>@aws-1-<REGION>.pooler.supabase.com:5432/postgres'
```

> ⚠️ `.env` dosyaları repo'da yok — değişkeni kendi shell'ine export et veya dev komutunun başına inline geç.

### apps/web (public site)

```bash
NETLIFY_DATABASE_URL='...' npm run dev -w apps/web
```

Astro dev server varsayılan olarak `http://localhost:4321` üzerinde ayağa kalkar.

### apps/admin (yönetim paneli)

Admin API'si Netlify Functions üzerinde çalıştığından iki süreç birlikte gerekir:

```bash
# 1. terminal: Netlify Functions'ı yerelde ayağa kaldırır (varsayılan port 8888)
cd apps/admin
NETLIFY_DATABASE_URL='...' SESSION_SECRET='...' netlify dev

# 2. terminal: Vite dev server (varsayılan port 5173)
npm run dev -w apps/admin
```

`apps/admin/vite.config.ts` içinde `/api` istekleri otomatik olarak `http://localhost:8888` adresine proxy'lenir, bu yüzden Vite dev server'ı ile `netlify dev`'in aynı anda çalışması gerekir.

> Sadece UI üzerinde çalışıp API'ye gitmeyecekseniz `netlify dev`'i atlayıp yalnız Vite'ı başlatabilirsiniz; ancak login/slider/duyuru işlemleri 502 döner.

### Debug ipuçları

- **Bağlantıyı hızlıca doğrula** (herhangi bir tabloya dokunmadan):
  ```bash
  node -e "import('postgres').then(async ({default:pg})=>{const s=pg(process.env.NETLIFY_DATABASE_URL,{prepare:false}); console.log(await s\`select 1 as ok\`); await s.end();})"
  ```
- **Migration'ları uygula** (idempotent, çalışmışları atlar):
  ```bash
  NETLIFY_DATABASE_URL='...' npm run db:migrate -w apps/admin
  ```
- **Admin kullanıcısı oluştur / şifreyi güncelle** (upsert):
  ```bash
  cd apps/admin && NETLIFY_DATABASE_URL='...' npm run db:create-admin <kullanici> '<sifre>'
  ```
- **Supabase pooler notları**:
  - Kullanıcı adı `postgres.<PROJECT-REF>` formatındadır (nokta önemlidir).
  - Port `5432` = session mode (uzun ömürlü bağlantı), `6543` = transaction mode (serverless için). postgres.js her ikisinde de `prepare: false` ile çalışır.
  - Bazı shell'ler `!` gibi karakterleri genişletir; connection string'i her zaman **tek tırnak** içinde tut.
- **API'yi curl'le dene** (`netlify dev` port 8888):
  ```bash
  curl -i http://localhost:8888/api/sliders
  curl -i -X POST http://localhost:8888/api/auth/login \
    -H 'content-type: application/json' \
    -d '{"username":"bycem","password":"..."}'
  ```
- **DB tarafı log**: postgres.js sorgu loglamak için `postgres(url, { debug: (conn, q, params) => console.log(q, params) })` opsiyonuyla başlat.
- **Sık hatalar**:
  - `password authentication failed for user "postgres"` → connection string'deki `postgres.<ref>` kısmındaki `.<ref>` düşürülmüş demektir (genelde tırnaksız geçmekten kaynaklanır).
  - `NETLIFY_DATABASE_URL gerekli` → değişkeni ilgili komutun başına inline geçin veya `export` edin.
  - `netlify: command not found` → `npm i -g netlify-cli` ile kurun.

### Testler

```bash
npm test -w apps/admin   # vitest — API/auth/session testleri (~79 test)
npm test -w apps/web     # vitest — sayfa/sorgu testleri
```

## Netlify kurulumu

Bu monorepo **iki ayrı Netlify sitesi** olarak deploy edilir; ikisi de aynı repoyu kullanır ama farklı base directory ile:

1. **Site 1 — public site**
   - Base directory: `apps/web`
   - Build command / publish: `apps/web/netlify.toml` içinde tanımlı (`npm run build`, publish `dist`)
2. **Site 2 — admin panel**
   - Base directory: `apps/admin`
   - Build command / publish: `apps/admin/netlify.toml` içinde tanımlı (`npm run build`, publish `dist`, functions `netlify/functions`)

### Veritabanı (Postgres — Supabase / kendi Postgres'iniz)

1. Bir Postgres örneği hazırlayın (Supabase, self-hosted, RDS, vb.). Supabase kullanıyorsanız connection pooling connection string'ini alın (bkz. Supabase → Project → Connect → "Connection pooling").
2. Bu URL'i her iki Netlify sitesinde `NETLIFY_DATABASE_URL` ortam değişkeni olarak tanımlayın (Site settings → Environment variables). İki site de **aynı** URL'i kullanmalıdır.
3. Migration'ları çalıştırın (bkz. aşağıdaki "Migration çalıştırma" bölümü).

### Domain önerisi

- Public site: `umayokculuk.com` (veya kurumun ana domaini)
- Admin panel: `panel.umayokculuk.com` gibi ayrı bir subdomain — iki uygulamanın birbirinden izole olması güvenlik açısından önemlidir.

## Ortam değişkenleri

| Değişken | Hangi app | Açıklama |
|---|---|---|
| `NETLIFY_DATABASE_URL` | `apps/web`, `apps/admin` | Postgres bağlantı adresi (örn. Supabase pooler URL'i). Adı geriye dönük uyumluluk için `NETLIFY_` prefix'iyle kalmıştır; herhangi bir Postgres URL'i olabilir. |
| `SESSION_SECRET` | `apps/admin` | JWT oturum çerezini imzalamak için kullanılan rastgele anahtar. |

Örnek dosyalar: `apps/admin/.env.example`, `apps/web/.env.example`.

## Admin kullanıcıları

Panel girişi kullanıcı adı + şifre ile yapılır. Kullanıcılar `admin_users` tablosunda tutulur; şifre düz metin olarak değil, bcrypt hash'i olarak saklanır. Kullanıcı eklemek veya var olan bir kullanıcının şifresini güncellemek için (`apps/admin` dizininde, `NETLIFY_DATABASE_URL` tanımlıyken):

```bash
cd apps/admin
npm run db:create-admin <kullanici-adi> '<sifre>'
```

Komut kullanıcıyı ekler; kullanıcı zaten varsa şifresini günceller (upsert).

## `SESSION_SECRET` üretme

```bash
openssl rand -base64 32
```

Çıktıyı `SESSION_SECRET` ortam değişkenine atayın. Bu değer değiştirildiğinde mevcut tüm oturumlar geçersiz olur.

## Migration çalıştırma

Şema, `apps/admin/db/migrations` altındaki SQL dosyalarıyla yönetilir ve `schema_migrations` tablosu üzerinden idempotent şekilde uygulanır:

```bash
NETLIFY_DATABASE_URL=... npm run db:migrate -w apps/admin
```

Yeni bir migration eklemek için `apps/admin/db/migrations` altına sıra numarasıyla (`002_...sql` gibi) yeni bir dosya eklemeniz yeterlidir; script zaten uygulanmış dosyaları atlar.

## Logo notu

- `apps/web/public/logo.png` şu anda yer tutucu bir dosyadır (68 byte). Gerçek kulüp logosu eski siteden kopyalanıp bu yola yerleştirilmelidir.
- `apps/admin` içindeki `Login.tsx` ve `AppLayout.tsx` da `/logo.png` yoluna referans verir; admin panelinde logonun görünmesi için aynı dosyanın `apps/admin/public/logo.png` olarak eklenmesi gerekir (bu dosya henüz mevcut değildir).

## Güvenlik özeti

- **Çerez tabanlı oturum**: Kimlik doğrulama JWT ile yapılır ve token httpOnly, secure çerezde tutulur — `localStorage`/`sessionStorage` kullanılmaz, bu da XSS ile token çalınmasını engeller.
- **Rate limiting**: Giriş denemeleri `login_attempts` tablosunda IP bazında veritabanına kaydedilir ve `netlify/lib/rateLimit.ts` üzerinden sınırlandırılır (kaba kuvvet saldırılarına karşı).
- **HTML sanitization**: Duyuru içerikleri (TipTap editöründen gelen HTML) `sanitize-html` ile temizlenir (`netlify/lib/sanitize.ts`), veritabanına yazılmadan önce zararlı etiket/attribute'lar süzülür.
- **Güvenlik başlıkları**: Her iki `netlify.toml` dosyasında da `X-Content-Type-Options`, `Referrer-Policy` gibi başlıklar tanımlı; admin sitesinde ayrıca `X-Frame-Options` ve katı bir `Content-Security-Policy` uygulanır.
- **İki uygulama izolasyonu**: Public site ve admin panel ayrı Netlify siteleri olarak deploy edilir, ayrı domain/subdomain kullanır ve admin API'sine sadece admin sitesi üzerinden erişilebilir — public sitenin ihlali admin paneline doğrudan erişim sağlamaz.
