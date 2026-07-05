# Umay Okçuluk — Monorepo

Umay Okçuluk kulübü için genel web sitesi ve yönetim panelini içeren monorepo. İki bağımsız uygulama, tek bir Neon (Netlify DB) veritabanını paylaşır.

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

### apps/web (public site)

```bash
npm run dev -w apps/web
```

Astro dev server'ı ayağa kaldırır. Veritabanı sorguları için `NETLIFY_DATABASE_URL` ortam değişkeninin tanımlı olması gerekir (bkz. aşağıdaki tablo).

### apps/admin (yönetim paneli)

Admin API'si Netlify Functions üzerinde çalıştığından iki süreç birlikte gerekir:

```bash
# 1. terminal: Netlify Functions'ı yerelde ayağa kaldırır (varsayılan port 8888)
cd apps/admin
netlify dev

# 2. terminal: Vite dev server (varsayılan port 5173)
npm run dev -w apps/admin
```

`apps/admin/vite.config.ts` içinde `/api` istekleri otomatik olarak `http://localhost:8888` adresine proxy'lenir, bu yüzden Vite dev server'ı ile `netlify dev`'in aynı anda çalışması gerekir.

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

### Veritabanı (Netlify DB / Neon)

1. Admin sitesinde (veya hangi site önce kurulursa) **Netlify DB** eklentisini etkinleştirin. Bu, Neon üzerinde bir Postgres veritabanı oluşturur ve `NETLIFY_DATABASE_URL` ortam değişkenini otomatik olarak siteye enjekte eder.
2. Aynı veritabanını **ikinci siteye de bağlayın**: Netlify dashboard'da ilgili DB'yi diğer siteye "shared/linked" env var olarak ekleyin (Site settings → Environment variables → Netlify DB bağlantısını paylaş), böylece her iki site de aynı `NETLIFY_DATABASE_URL` değerini kullanır.
3. Migration'ları çalıştırın (bkz. aşağıdaki "Migration çalıştırma" bölümü).

### Domain önerisi

- Public site: `umayokculuk.com` (veya kurumun ana domaini)
- Admin panel: `panel.umayokculuk.com` gibi ayrı bir subdomain — iki uygulamanın birbirinden izole olması güvenlik açısından önemlidir.

## Ortam değişkenleri

| Değişken | Hangi app | Açıklama |
|---|---|---|
| `NETLIFY_DATABASE_URL` | `apps/web`, `apps/admin` | Neon Postgres bağlantı adresi. Netlify DB eklendiğinde otomatik enjekte edilir; yerelde migration/test için elle tanımlanabilir. |
| `ADMIN_PASSWORD_HASH` | `apps/admin` | Panel girişi için tek paylaşımlı şifrenin bcrypt hash'i. Kod tabanında düz metin şifre tutulmaz. |
| `SESSION_SECRET` | `apps/admin` | JWT oturum çerezini imzalamak için kullanılan rastgele anahtar. |

Örnek dosyalar: `apps/admin/.env.example`, `apps/web/.env.example`.

## Şifre hash'i üretme (admin)

Admin girişi tek bir paylaşımlı şifre kullanır; şifre düz metin olarak değil, bcrypt hash'i (`ADMIN_PASSWORD_HASH`) olarak saklanır. `apps/admin` dizininde (bcryptjs bağımlılığı orada kurulu olduğu için) şu komutla hash üretin:

```bash
cd apps/admin
node -e "import('bcryptjs').then(b=>b.hash(process.argv[1],12).then(console.log))" 'sifreniz'
```

Bu komut doğrulanmıştır ve şuna benzer bir çıktı üretir:

```
$2b$12$Z5BS0hdLabOQHxZttJbRBOJbX85Ujx5N8oBN0Qhuu22W7/D7Z4xGm
```

Çıktıyı olduğu gibi `ADMIN_PASSWORD_HASH` ortam değişkenine yapıştırın (Netlify dashboard veya yerel `.env`).

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
