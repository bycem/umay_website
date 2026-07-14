# Graph Report - umay_genel  (2026-07-14)

## Corpus Check
- 113 files · ~56,308 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 607 nodes · 700 edges · 64 communities (39 shown, 25 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e4e3778b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]

## God Nodes (most connected - your core abstractions)
1. `Global Constraints` - 23 edges
2. `json()` - 18 edges
3. `Sql` - 15 edges
4. `Umay Okçuluk Web Sitesi Yeniden Yazımı — Tasarım Dokümanı` - 12 edges
5. `Task 16 Report: Admin SPA — Duyuru yönetimi sayfası (TipTap)` - 11 edges
6. `Task 22 Report: README + deployment dokümantasyonu` - 11 edges
7. `login()` - 10 edges
8. `compilerOptions` - 10 edges
9. `../layouts/Layout.astro` - 10 edges
10. `Umay Okçuluk — Monorepo` - 10 edges

## Surprising Connections (you probably didn't know these)
- `buildApi()` --calls--> `createRouter()`  [EXTRACTED]
  apps/admin/netlify/functions/api.ts → apps/admin/netlify/lib/router.ts
- `validateAnn()` --calls--> `sanitizeContent()`  [EXTRACTED]
  apps/admin/netlify/handlers/announcements.ts → apps/admin/netlify/lib/sanitize.ts
- `validateAnn()` --calls--> `makeSummary()`  [EXTRACTED]
  apps/admin/netlify/handlers/announcements.ts → apps/admin/netlify/lib/summary.ts
- `listAnnouncements()` --calls--> `Sql`  [EXTRACTED]
  apps/admin/netlify/handlers/announcements.ts → apps/admin/netlify/lib/rateLimit.ts
- `listAnnouncements()` --calls--> `json()`  [EXTRACTED]
  apps/admin/netlify/handlers/announcements.ts → apps/admin/netlify/lib/router.ts

## Import Cycles
- None detected.

## Communities (64 total, 25 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (43): buildApi(), config, AnnBody, createAnnouncement(), deleteAnnouncement(), listAnnouncements(), parseId(), updateAnnouncement() (+35 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (33): App(), Phase, AppLayoutProps, NAV_ITEMS, NavKey, ConfirmDialogProps, ModalProps, RichTextEditorProps (+25 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (31): dependencies, bcryptjs, jose, @neondatabase/serverless, react, react-dom, sanitize-html, @tiptap/extension-image (+23 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (18): ../components/AnnouncementCard.astro, ../components/Footer.astro, ../components/Header.astro, navLinks, ../components/HeroSlider.astro, ../layouts/Layout.astro, sql, formatDateTr() (+10 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (24): Global Constraints, Task 10: Slider CRUD handler'ları (TDD), Task 11: Duyuru CRUD handler'ları (TDD), Task 12: Function entry + guard'lar + netlify.toml (admin), Task 13: Admin SPA — tasarım token'ları, API istemcisi, auth akışı, Login ekranı, Task 14: Admin SPA — AppLayout (sidebar), Toast, Modal, ConfirmDialog, Task 15: Admin SPA — Slider yönetimi sayfası, Task 16: Admin SPA — Duyuru yönetimi sayfası (TipTap) (+16 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (17): AnnouncementsPage.tsx, Build + test verification, Commit, Commit, Files changed, Finding, Fix applied, Fix: duplicate TipTap extensions (link/underline) — 2026-07-05 (+9 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (16): 10. Deployment, 11. Kapsam Dışı, 1. Amaç ve Kapsam, 2. Mimari, 3.1 Palet, 3.2 Tipografi, 3.3 Bileşenler (public), 3.4 Admin panel görünümü (+8 more)

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (15): dependencies, astro, @astrojs/netlify, @neondatabase/serverless, devDependencies, typescript, vitest, name (+7 more)

### Community 8 - "Community 8"
Cohesion: 0.12
Nodes (15): Admin kullanıcıları, apps/admin (yönetim paneli), apps/web (public site), Domain önerisi, Güvenlik özeti, Logo notu, Migration çalıştırma, Netlify kurulumu (+7 more)

### Community 9 - "Community 9"
Cohesion: 0.12
Nodes (15): App.tsx wiring, Commit, Commit, Components (`apps/admin/src/components/`), Concerns, Finding 1 (Important) — Toast timer leak, Finding 2 (Minor) — `handleLogout` no error handling, Fix: code review findings (2026-07-05) (+7 more)

### Community 10 - "Community 10"
Cohesion: 0.12
Nodes (15): Addendum — final whole-branch review fixes (Fix 1 & Fix 2), bcryptjs hash command — VERIFIED, Build / test verification, Commit, Commits, Concerns, Files created, Fix 1 — shadow design token drift (`apps/admin/src/styles/tokens.css`) (+7 more)

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (15): Baseline (before writing new test) — confirm existing suite green, Commits, Concerns, Files, Final state, Self-Review, Status: DONE, Step 1: Install jose (+7 more)

### Community 12 - "Community 12"
Cohesion: 0.13
Nodes (14): Baseline (before any change), Branch, Commit, Dependency install, Files, GREEN — after implementing `apps/admin/netlify/handlers/auth.ts`, Implementation notes, Post-commit sanity re-run (+6 more)

### Community 13 - "Community 13"
Cohesion: 0.14
Nodes (13): Commit, Commit, Discrimination evidence (reversed-order → fail, restored → pass), Findings addressed, Pristine check, Review Fix: Strengthen router tests, Self-review, Step 1-2: RED (test written, run before implementation) (+5 more)

### Community 14 - "Community 14"
Cohesion: 0.15
Nodes (12): 1. Veritabanı, 2. Backend — `apps/admin/netlify/handlers/sliders.ts`, 3. Public site — `apps/web/src/lib/queries.ts`, 4. Admin UI — `apps/admin/src/pages/SlidersPage.tsx`, 5. Hızlı aktif/pasif geçişi (her iki sayfa), 6. Testler, Amaç, Değişiklikler (+4 more)

### Community 15 - "Community 15"
Cohesion: 0.15
Nodes (12): Commit, Concerns, Self-review, Status: DONE, Step 1 — Failing test written, Step 2 — FAIL confirmed, Step 3 — Implementation (verbatim from brief), Step 4 — PASS confirmed (+4 more)

### Community 16 - "Community 16"
Cohesion: 0.17
Nodes (11): compilerOptions, jsx, lib, module, moduleResolution, noEmit, skipLibCheck, strict (+3 more)

### Community 17 - "Community 17"
Cohesion: 0.17
Nodes (11): Commit, fakeSql pattern used, Files, GREEN — after writing the handler, RED — before writing the handler, Self-review, Summary, Task 11 Report: Duyuru CRUD handler'ları (+3 more)

### Community 18 - "Community 18"
Cohesion: 0.17
Nodes (11): Build check, Commands run, Files created, formatDateTr exact-string verification, Self-review, Status: DONE, Step 1-2: RED (before implementation), Step 3: Implementation (+3 more)

### Community 19 - "Community 19"
Cohesion: 0.17
Nodes (11): AnnouncementCard.astro, Build-time DB observation (important), Commit, Concerns, Files created/modified, HeroSlider.astro, Implementation notes, index.astro (+3 more)

### Community 20 - "Community 20"
Cohesion: 0.17
Nodes (11): `404.astro`, `500.astro`, Build / DB observation, Commit, `duyuru/[id].astro`, Files created, Implementation notes, Self-review checklist (+3 more)

### Community 21 - "Community 21"
Cohesion: 0.17
Nodes (11): 1. Install, 2. RED — failing test written first, 3. GREEN — implementation, 4. Commit, Expected-string adjustment check, Outcome, Regression check, Self-review (+3 more)

### Community 22 - "Community 22"
Cohesion: 0.18
Nodes (10): Commits, Concerns, Files created, hakkimizda.astro, iletisim.astro, Self-review checklist, Status: DONE, Task 20 Report: Web — Hakkımızda ve İletişim sayfaları (+2 more)

### Community 23 - "Community 23"
Cohesion: 0.20
Nodes (9): Commit, Files, GREEN (after implementation), Implementation notes, RED (before implementation existed), Self-review, Task 10 Report: Slider CRUD handler'ları (TDD), TDD Evidence (+1 more)

### Community 24 - "Community 24"
Cohesion: 0.20
Nodes (9): Behavior implemented, Commit, Concerns, Files changed, Self-review notes, Status: DONE, Summary, Task 15 Report: Admin SPA — Slider Yönetimi Sayfası (+1 more)

### Community 25 - "Community 25"
Cohesion: 0.22
Nodes (8): Commits, Concerns, Files created, Files modified, Self-review, Status: DONE, Task 13 Report: Admin SPA — tasarım token'ları, API istemcisi, auth akışı, Login ekranı, Verification

### Community 26 - "Community 26"
Cohesion: 0.22
Nodes (8): Commit, Files Changed, GREEN — passing test after implementation, RED — failing test before implementation existed, Self-Review, Summary, Task 3 Report: makeSummary (TDD), TDD Evidence

### Community 27 - "Community 27"
Cohesion: 0.22
Nodes (8): Concerns, Files, Self-Review, Step 1-2: RED — failing test confirmed (module not found), Step 3: Implementation, Step 4: GREEN — all pass, pristine output, Task 4 Report: Görsel URL doğrulama (TDD), TDD Evidence

### Community 28 - "Community 28"
Cohesion: 0.22
Nodes (8): Commit, Files, Self-Review, Step 1-2: RED (test written, confirmed failing for the right reason), Step 3: Implementation, Step 4: GREEN (confirmed passing, pristine), Task 7 Report: Rate limiting (TDD), TDD Evidence

### Community 29 - "Community 29"
Cohesion: 0.29
Nodes (6): Concerns / follow-ups, Self-review checklist, Status: DONE, Steps executed, Task 17 Report — Web app scaffold (Astro + Layout + Header + Footer), What was built

### Community 30 - "Community 30"
Cohesion: 0.29
Nodes (6): Files changed (git diff --stat from commit fbde900), Issues or concerns, Self-review, Task 1 Report: Monorepo iskeleti + admin app scaffold, What I implemented, What I verified

### Community 31 - "Community 31"
Cohesion: 0.29
Nodes (6): Files changed, Issues or concerns, Self-review findings, Task 2 Report: DB şeması ve migration altyapısı, What I implemented, What I verified

### Community 32 - "Community 32"
Cohesion: 0.33
Nodes (5): engines, node, name, private, workspaces

### Community 33 - "Community 33"
Cohesion: 0.50
Nodes (3): applied, dir, sql

### Community 34 - "Community 34"
Cohesion: 0.50
Nodes (3): exclude, extends, include

## Knowledge Gaps
- **369 isolated node(s):** `config`, `AnnBody`, `DUMMY_HASH`, `SliderBody`, `sql` (+364 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `config`, `AnnBody`, `DUMMY_HASH` to the rest of the system?**
  _369 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07412008281573498 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06285714285714286 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.1053763440860215 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._