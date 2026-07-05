# Slider Yayın/Bitiş Tarihi + Listede Hızlı Aktif/Pasif — Tasarım

Tarih: 2026-07-05

## Amaç

Admin panelinde slider ve duyuru yönetimini, yayın zamanlaması ve hızlı durum
değişimi ile güçlendirmek.

Mevcut durum tespiti:

- **Duyurular** zaten `publish_date` (yayın tarihi) ve `is_active` (aktif/pasif)
  alanlarına sahip. Public site `getRecentAnnouncements` / `getAnnouncementById`
  sorguları `WHERE is_active AND publish_date <= NOW()` filtresini uygular.
- **Slider'lar** yalnızca `is_active` alanına sahip; yayın tarihi yok. Public
  `getActiveSliders` sorgusu sadece `WHERE is_active` filtreler.

Bu tasarım aradaki farkı kapatır ve her iki liste için tek tıkla aktif/pasif
geçişi ekler.

## Kapsam

1. Slider'lara **yayın tarihi** (başlangıç, varsayılan `NOW()`) ve **isteğe
   bağlı bitiş tarihi** (boş = süresiz) eklenir.
2. Public site slider sorgusu yayın penceresini dikkate alır.
3. Slider ve Duyuru admin tablolarında **tek tıkla aktif/pasif** geçişi eklenir.

Kapsam dışı (bilinçli): Duyurulara bitiş tarihi eklenmez. Hızlı geçişte onay
dialoğu gösterilmez.

## Değişiklikler

### 1. Veritabanı

Yeni migration: `apps/admin/db/migrations/002_slider_publish_dates.sql`

```sql
ALTER TABLE sliders ADD COLUMN publish_date TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE sliders ADD COLUMN end_date TIMESTAMPTZ;   -- NULL = süresiz
DROP INDEX IF EXISTS idx_sliders_active_order;
CREATE INDEX idx_sliders_active_publish ON sliders(is_active, publish_date);
```

`migrate.mjs` dosyaları alfabetik sırayla uygular; `002_` öneki `001_init.sql`
sonrasında çalışır. Statement'lar `;` ile ayrılıp tek tek çalıştırıldığı için
her ifade ayrı satır/ifade olmalıdır.

### 2. Backend — `apps/admin/netlify/handlers/sliders.ts`

- `SliderBody` tipine `publish_date?: unknown` ve `end_date?: unknown` eklenir.
- `validateSlider`:
  - `publish_date`: string ve doluysa `new Date(...).toISOString()`, aksi halde
    `new Date().toISOString()`.
  - `end_date`: string ve doluysa `new Date(...).toISOString()`, aksi halde
    `null`.
  - **Guard:** `end_date` doluysa ve `end_date < publish_date` ise
    `{ error: 'Bitiş tarihi yayın tarihinden önce olamaz' }` (400).
  - Dönüş tipi `data`'ya `publish_date: string; end_date: string | null` eklenir.
- `listSliders`: `SELECT ... , publish_date, end_date ...`.
- `createSlider`: `INSERT ... publish_date, end_date` + `RETURNING` bu alanları
  içerir.
- `updateSlider`: `UPDATE ... publish_date = ..., end_date = ...` + `RETURNING`.

### 3. Public site — `apps/web/src/lib/queries.ts`

`getActiveSliders`:

```sql
SELECT id, title, description, image_url FROM sliders
WHERE is_active AND publish_date <= NOW() AND (end_date IS NULL OR end_date >= NOW())
ORDER BY sort_order, id
```

`Slider` tipi değişmez (sitede tarih alanı gösterilmiyor).

### 4. Admin UI — `apps/admin/src/pages/SlidersPage.tsx`

- `Slider` arayüzüne `publish_date: string; end_date: string | null` eklenir.
- `SliderFormState`'e `publish_date: string; end_date: string` eklenir
  (`end_date` için boş string = bitiş yok).
- `toLocalDateTimeInput` yardımcı fonksiyonu (AnnouncementsPage'dekiyle aynı)
  eklenir; ortak kullanım için gerekirse ayrı bir dosyaya taşınabilir, ancak
  ilk adımda kopya kabul edilebilir.
- `EMPTY_FORM` → `publish_date` = şimdi, `end_date` = `''`.
- `sliderToForm`: `publish_date`'i local input formatına çevirir; `end_date`
  varsa çevirir, yoksa `''`.
- Form: iki `datetime-local` alanı — "Yayın Tarihi" ve "Bitiş Tarihi
  (opsiyonel)".
- `handleSubmit` payload: `publish_date` → ISO; `end_date` → doluysa ISO, boşsa
  `null`.
- Tabloya "Yayın Tarihi" sütunu eklenir (`dateFormatter` ile). İstenirse bitiş
  tarihi de aynı hücrede küçük not olarak gösterilebilir.

### 5. Hızlı aktif/pasif geçişi (her iki sayfa)

- "Durum" hücresindeki rozet, tıklanabilir bir `<button>` haline getirilir.
- Tıklanınca ilgili kaydın tam objesi, `is_active` tersine çevrilerek mevcut
  `PUT /api/{sliders|announcements}/:id` endpoint'ine gönderilir. Yeni backend
  route gerekmez — liste sorguları zaten tam objeyi döndürüyor.
  - Slider payload: `{ title, description, image_url, sort_order, is_active: !cur, publish_date, end_date }`.
  - Duyuru payload: `{ title, content, publish_date, is_active: !cur }`.
    (Backend `content`'i yeniden sanitize eder ve `summary`'yi yeniden üretir;
    idempotent olduğu için sorun değil.)
- Başarıda liste yenilenir ve toast gösterilir ("Aktif edildi" / "Pasife
  alındı"). Geçiş sırasında ilgili satır için bir yükleniyor/disabled durumu
  tutulur (çift tıklamayı önlemek için).

### 6. Testler

- `apps/admin/tests/sliders.test.ts`:
  - `validateSlider`/create yeni alanları kabul ediyor.
  - `end_date` boşken `null` kaydediliyor.
  - `end_date < publish_date` guard'ı 400 döndürüyor.
- Mevcut test stiline uyulur (bkz. dosyanın var olan yapısı).

## Veri Akışı

Admin form → PUT/POST `/api/sliders` → `validateSlider` (tarih normalizasyonu +
guard) → Postgres. Public sayfa render → `getActiveSliders` (yayın penceresi
filtresi) → yalnızca aktif ve zaman aralığındaki slider'lar.

## Hata Yönetimi

- Geçersiz `end_date < publish_date`: 400, Türkçe mesaj, formda gösterilir.
- Geçersiz görsel URL / boş başlık: mevcut davranış korunur.
- Hızlı geçiş isteği hata verirse toast ile bildirilir, liste eski haline
  kalır (istek başarısızsa yeniden yükleme yapılmaz).
```
