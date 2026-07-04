# Umay Okçuluk Web Sitesi Yeniden Yazımı — Tasarım Dokümanı

Tarih: 2026-07-04 · Durum: Onaylandı (Bölüm 1-3 kullanıcı onaylı; Bölüm 4 kararları kullanıcının
"kalanları sen karar ver" yetkisiyle verildi)

## 1. Amaç ve Kapsam

Mevcut Express + Supabase + string-template SSR uygulamasının sıfırdan yeniden yazımı:

- **Modern görsel kimlik** (tamamen yeni — eski lacivert+altın kimlik bırakılıyor)
- **Netlify DB (Neon Postgres)** veritabanı
- **Şifre ile admin girişi** (Google OAuth kaldırılıyor) + rate limiting
- **İki ayrı deploy edilebilir uygulama:** public site + admin panel (güvenlik izolasyonu)

Kullanıcı kararları:
- Admin girişi: **tek ortak şifre** (hesap sistemi yok)
- Görseller: **sadece harici URL** (dosya upload yok)
- Turnuva bağı: **tamamen ayrıldı** — `settings`, `admin_users`, `tournament_public_access` yok.
  Nav'daki "Turnuva Uygulaması" dış linki korunur.

## 2. Mimari

Monorepo (npm workspaces), iki bağımsız Netlify sitesi:

```
umay_genel/
├── apps/
│   ├── web/                       → Netlify Sitesi #1 (public, ör. umayokculuk.com)
│   │   ├── src/pages/             Astro SSR: /, /hakkimizda, /iletisim, /duyuru/[id]
│   │   ├── src/components/        Header, Footer, HeroSlider, AnnouncementCard...
│   │   ├── src/lib/db.ts          Neon'a salt-okunur sorgular
│   │   └── netlify.toml
│   └── admin/                     → Netlify Sitesi #2 (ör. panel.umayokculuk.com)
│       ├── src/                   Vite + React SPA
│       ├── netlify/functions/     api.ts (router: auth, sliders, announcements)
│       ├── db/migrations/         *.sql — şemanın sahibi admin app
│       ├── scripts/migrate.mjs    Migration çalıştırıcı
│       └── netlify.toml
└── package.json                   workspaces: ["apps/*"]
```

- **Stack:** Public = Astro SSR (`@astrojs/netlify` adapter). Admin = Vite + React SPA +
  Netlify Functions API.
- İki app **hiç kod paylaşmaz**; tek ortak nokta aynı Neon DB. `web` sadece SELECT,
  `admin` tam CRUD.
- DB erişimi: `@neondatabase/serverless`. Env: `NETLIFY_DATABASE_URL` (Netlify DB otomatik
  enjekte eder; admin sitesine shared env var olarak bağlanır).
- Public sayfalar tamamen SSR — slider/duyurular sunucuda render edilir, **public API yok**.
  Slider'ın otomatik dönüşü için küçük vanilla JS.
- Netlify'da her sitenin base directory'si kendi app klasörü (`apps/web`, `apps/admin`).

## 3. Görsel Kimlik — "Ok & Mürekkep"

Sıcak nötr zemin, vermilyon (hedef kırmızısı) vurgu, iri tipografi, editoryal minimalizm.

### 3.1 Palet

```css
--bg:           #FAF9F6;   /* sıcak kırık beyaz — sayfa zemini */
--surface:      #FFFFFF;   /* kartlar */
--ink:          #16181D;   /* metin + koyu bölümler (footer, hero overlay) */
--ink-soft:     #575D68;   /* ikincil metin */
--muted:        #9AA1AC;
--accent:       #E0452F;   /* vermilyon — linkler, CTA, vurgu */
--accent-dark:  #B93524;   /* hover */
--accent-tint:  #FCEBE8;   /* rozet/chip zemini */
--line:         #E8E6E1;   /* kenarlıklar */
--shadow-sm: 0 1px 3px rgba(22,24,29,0.06);
--shadow-md: 0 6px 16px rgba(22,24,29,0.08);
--shadow-lg: 0 12px 32px rgba(22,24,29,0.12);
```

### 3.2 Tipografi
- Başlıklar: `Space Grotesk` (600/700), gövde: `Inter` (Google Fonts).
- Akışkan ölçüler: hero H2 `clamp(2rem, 5vw, 3.5rem)`, bölüm başlığı `clamp(1.8rem, 3vw, 2.5rem)`.
- Bölüm başlıkları üstünde accent renkli, uppercase, harf aralıklı (0.12em) **overline etiketi**
  (ör. "DUYURULAR") — eski altın alt çizginin yerini alır.

### 3.3 Bileşenler (public)
- **Nav:** sticky, `rgba(250,249,246,0.9)` + `backdrop-filter: blur(12px)`, 72px, alt kenarlık
  `--line`. Logo solda (40px), linkler sağda, "Turnuva Uygulaması" outline buton. Mobilde
  hamburger → tam ekran menü. Tek breakpoint: 768px.
- **Hero slider:** `70vh` (min 480px, mobil 60vh), tam genişlik, `object-fit: cover`. Overlay:
  sol-alt hizalı başlık + açıklama, `linear-gradient(180deg, transparent 30%, rgba(22,24,29,0.75))`.
  Göstergeler: dot yerine **ince progress-bar'lar** — aktif olan 5000ms'de dolar (CSS animasyonu),
  otomatik geçişi görselleştirir. Otomatik dönüş 5000ms, hover'da durur, uçlarda döngü. Oklar:
  44px yarı saydam koyu daire (`rgba(22,24,29,0.5)`), beyaz ikon. Boş durum: "Henüz slider
  eklenmemiş" + oklar/göstergeler gizli.
- **Duyuru kartları:** grid `repeat(auto-fill, minmax(320px, 1fr))`, 24px gap (mobil tek sütun).
  16px radius, kenarlıksız, `--shadow-sm` → hover `--shadow-md` + `translateY(-3px)`. Tarih:
  `--accent-tint` zeminli chip, `tr-TR` uzun ay formatı ("2 Temmuz 2026"). Başlık + summary +
  "Devamını oku →" (accent). Anasayfada son 6 duyuru.
- **Duyuru detayı:** dar içerik sütunu (max 720px), rich HTML render, üstte tarih chip + başlık,
  geri linki.
- **Footer:** `--ink` zemin, açık metin. Logo + marka, adres, Instagram SVG, en altta geliştirici
  kredisi (0.78rem, üst kenarlık `rgba(255,255,255,0.1)`).
- **Hareket:** bölümlerin scroll'da fade-up girişi (IntersectionObserver),
  `prefers-reduced-motion: reduce` desteklenir. Geçişler `transform 0.5s ease`.

### 3.4 Admin panel görünümü
- Aynı palet, SaaS tarzı. Solda ince sidebar (Slider / Duyurular / Çıkış), mobilde üste daralır.
- Login: `--ink` zemin, ortalanmış tek kart (max 400px), logo + şifre alanı + giriş butonu.
- Tablolar: uppercase 0.8rem başlıklar, satır hover tint. Görsel önizleme 80×45px cover.
- Durum rozetleri: Aktif = yeşil tint, Pasif = kırmızı tint. Modal: blur overlay, 16px radius,
  max 560px. Form focus: `--accent`. Toast: sağ üst, 3000ms, dikey yığılır.

## 4. Kimlik Doğrulama ve Güvenlik (Admin)

1. Şifre `bcrypt` hash olarak env'de: `ADMIN_PASSWORD_HASH`. Düz metin hiçbir yerde yok.
2. `POST /api/auth/login` → `bcrypt.compare`. Başarılıysa HS256 JWT (`SESSION_SECRET` env),
   **httpOnly + Secure + SameSite=Strict cookie**, 24 saat. localStorage kullanılmaz.
3. SPA açılışta `GET /api/auth/me`; `POST /api/auth/logout` cookie'yi siler.
4. Tüm mutasyonlar JWT middleware + `Origin` header kontrolü arkasında.

**Rate limiting (DB destekli):** `login_attempts` tablosu (IP, zaman, başarı).
- IP başına: 15 dk içinde 5 başarısız → o IP 15 dk kilit (`429` + kalan süre).
- Global: 15 dk içinde toplam 20 başarısız → tüm girişler geçici kilit.
- Başarılı girişte IP sayacı sıfırlanır; 15 dk'dan eski kayıtlar her login denemesinde silinir.
- IP kaynağı: `x-nf-client-connection-ip` header (Netlify), yoksa `x-forwarded-for` ilk değer.

**Diğer:**
- Duyuru HTML'i kayıtta `sanitize-html` ile temizlenir. İzinli tag'ler: `h1 h2 h3 p br strong em
  u s blockquote pre code ol ul li a img`. `a`: yalnız `href` (`https?:`), `img`: yalnız `src`
  (`https?:`) + `alt`. Style/class/event attribute'ları atılır.
- Admin sitesi header'ları: `X-Frame-Options: DENY`, CSP (self + Google Fonts), `Referrer-Policy:
  strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`.
- Görsel URL doğrulaması (slider `image_url` + editör resim ekleme):
  `^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i` — hem istemci hem sunucuda.

## 5. Admin API

Tek Netlify Function (`api.ts`) içinde path-based router. Tümü (auth hariç) oturum korumalı.

| Method | Path | Açıklama |
|---|---|---|
| POST | `/api/auth/login` | `{password}` → cookie set. Rate limit burada. |
| POST | `/api/auth/logout` | Cookie temizle |
| GET | `/api/auth/me` | Oturum doğrulama → `{ok: true}` |
| GET | `/api/sliders` | Listele (pasifler dahil, sort_order sıralı) |
| POST | `/api/sliders` | Oluştur (title + image_url zorunlu) |
| PUT | `/api/sliders/reorder` | `{ids: [...]}` toplu sıralama — `:id`'den ÖNCE eşleşir |
| PUT | `/api/sliders/:id` | Güncelle |
| DELETE | `/api/sliders/:id` | Sil |
| GET | `/api/announcements` | Listele (limit ≤ 50, varsayılan 10, offset; `{announcements, total}`) |
| POST | `/api/announcements` | Oluştur — content sanitize + summary otomatik (tag'siz ilk 150 + "...") |
| PUT | `/api/announcements/:id` | Güncelle (sanitize + summary yeniden üretilir) |
| DELETE | `/api/announcements/:id` | Sil |

Editör: **TipTap** (React). Özellikler: H1-3, bold/italic/underline/strike, blockquote, code,
sıralı/sırasız liste, link, URL ile resim ekleme (regex doğrulamalı, Enter ile de eklenir).
Editör yüksekliği ~300px. Yayın tarihi `datetime-local` (varsayılan şimdi), aktif/pasif toggle,
silmede onay dialogu.

## 6. Veritabanı Şeması

```sql
CREATE TABLE sliders (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,               -- sanitize edilmiş TipTap HTML
  summary TEXT,                        -- otomatik: tag'siz ilk 150 karakter
  publish_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE login_attempts (
  id SERIAL PRIMARY KEY,
  ip VARCHAR(64) NOT NULL,
  success BOOLEAN NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sliders_active_order ON sliders(is_active, sort_order);
CREATE INDEX idx_announcements_active_date ON announcements(is_active, publish_date DESC);
CREATE INDEX idx_login_attempts_ip_time ON login_attempts(ip, attempted_at);
```

- Public görünürlük kuralı: `is_active = TRUE AND publish_date <= NOW()`.
- Migration'lar: `apps/admin/db/migrations/NNN_*.sql`, `scripts/migrate.mjs` ile uygulanır
  (`schema_migrations` tablosunda takip; `npm run db:migrate`, `NETLIFY_DATABASE_URL` ile).
- `admin_users` ve `settings` tabloları YOK (turnuva bağı koptu, tek şifre modeli).

## 7. Statik İçerik (Korunuyor)

- Adres: Hürriyet Mahallesi, Alan Sokak, No:29/B, Lüleburgaz / Kırklareli
- Instagram: @umay_okculuk · E-posta: umayokculuk@gmail.com
- İletişim sayfası: 3 iletişim kartı + Google Maps iframe embed
- Logo: `public/logo.png` (her iki app'e kopyalanır)
- Nav: Anasayfa · Hakkımızda · İletişim · Turnuva Uygulaması (dış link)
- Hakkımızda: kulüp tanıtımı + okçuluk felsefesi (mevcut metinler korunur; elde yoksa
  yer tutucu Türkçe metin yazılır, `<!-- İÇERİK: eski siteden taşınacak -->` yorumuyla işaretlenir)

## 8. Hata Yönetimi

- **Public:** Duyuru bulunamazsa / pasifse / ileri tarihliyse → 404 sayfası (tasarımlı).
  DB hatası → 500 sayfası (sade, tasarımlı). Slider boşsa boş durum mesajı.
- **Admin API:** JSON hata gövdesi `{error: "..."}`; 400 doğrulama, 401 oturumsuz, 403 origin
  uyumsuz, 404 kayıt yok, 429 rate limit, 500 beklenmedik. SPA hataları toast ile gösterir.
- Geçersiz `:id` (sayı olmayan) → 400.

## 9. Test Stratejisi

- **Vitest** (admin functions): auth (login doğru/yanlış şifre, cookie flag'leri, JWT süre),
  rate limiting (IP eşiği, global eşik, sıfırlama, süre dolumu), sanitize-html allowlist
  (script/style/onerror injection vakaları), summary üretimi (150 kesme, tag temizleme,
  Türkçe karakterler), görsel URL regex'i, router path eşleşmesi (`reorder` vs `:id`).
- **Vitest** (web): tarih formatlama (`tr-TR`), görünürlük sorgusu koşulları (SQL builder
  fonksiyonu üzerinden).
- DB katmanı testlerde mock'lanır (neon client sarmalayıcı arayüzle). E2E kapsam dışı.

## 10. Deployment

- İki Netlify sitesi, aynı repo: base `apps/web` ve `apps/admin`.
- `apps/web/netlify.toml`: Astro Netlify adapter yapılandırması.
- `apps/admin/netlify.toml`: SPA fallback redirect (`/* → /index.html`, 200; `/api/*` →
  function), güvenlik header'ları.
- Env değişkenleri: her iki site `NETLIFY_DATABASE_URL`; admin ek olarak
  `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`. README'de hash üretme komutu:
  `node -e "require('bcryptjs').hash(process.argv[1],12).then(console.log)" 'şifre'`.
- bcrypt yerine **bcryptjs** (native binding yok — Netlify Functions'ta sorunsuz).

## 11. Kapsam Dışı

- Dosya/görsel upload (harici URL ile devam)
- Turnuva uygulaması entegrasyonu (dış link hariç)
- Çoklu admin hesabı, 2FA, şifre sıfırlama akışı
- Koyu tema, çoklu dil
