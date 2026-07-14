# Graph Report - .  (2026-07-14)

## Corpus Check
- 116 files · ~56,308 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 361 nodes · 531 edges · 23 communities (20 shown, 3 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 47 edges (avg confidence: 0.86)
- Token cost: 338,767 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Admin API Handlers|Admin API Handlers]]
- [[_COMMUNITY_Admin SPA Components|Admin SPA Components]]
- [[_COMMUNITY_API Handlers & Routing (TDD)|API Handlers & Routing (TDD)]]
- [[_COMMUNITY_Web Utils & Task Reports|Web Utils & Task Reports]]
- [[_COMMUNITY_Admin Dependencies|Admin Dependencies]]
- [[_COMMUNITY_Astro Web Frontend|Astro Web Frontend]]
- [[_COMMUNITY_Admin SPA Auth & Task Docs|Admin SPA Auth & Task Docs]]
- [[_COMMUNITY_Web App Config & Deps|Web App Config & Deps]]
- [[_COMMUNITY_Admin TS Config|Admin TS Config]]
- [[_COMMUNITY_Session Module & Tests|Session Module & Tests]]
- [[_COMMUNITY_Monorepo Scaffold & SDD Ledger|Monorepo Scaffold & SDD Ledger]]
- [[_COMMUNITY_Root Workspace Config|Root Workspace Config]]
- [[_COMMUNITY_Admin Logo  Brand|Admin Logo / Brand]]
- [[_COMMUNITY_DB Migration Runner|DB Migration Runner]]
- [[_COMMUNITY_Web Logo  Brand Identity|Web Logo / Brand Identity]]
- [[_COMMUNITY_Web TS Config|Web TS Config]]
- [[_COMMUNITY_Admin User Seeder|Admin User Seeder]]
- [[_COMMUNITY_Web DB Client|Web DB Client]]
- [[_COMMUNITY_Visual Identity & Tokens|Visual Identity & Tokens]]

## God Nodes (most connected - your core abstractions)
1. `json()` - 18 edges
2. `Sql` - 15 edges
3. `Umay Web Rewrite Implementation Plan` - 11 edges
4. `login()` - 10 edges
5. `compilerOptions` - 10 edges
6. `../layouts/Layout.astro` - 10 edges
7. `announcements.ts Handler Module` - 8 edges
8. `SlidersPage Component` - 8 edges
9. `updateAnnouncement()` - 7 edges
10. `updateSlider()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Task 20: About & Contact Pages (brief)` --conceptually_related_to--> `Umay Web Rewrite Implementation Plan`  [INFERRED]
  .superpowers/sdd/task-20-brief.md → docs/superpowers/plans/2026-07-04-umay-web-rewrite.md
- `Task 21: Announcement Detail & Error Pages (brief)` --conceptually_related_to--> `Umay Web Rewrite Implementation Plan`  [INFERRED]
  .superpowers/sdd/task-21-brief.md → docs/superpowers/plans/2026-07-04-umay-web-rewrite.md
- `Task 22: README & Deployment Docs (brief)` --conceptually_related_to--> `Umay Web Rewrite Implementation Plan`  [INFERRED]
  .superpowers/sdd/task-22-brief.md → docs/superpowers/plans/2026-07-04-umay-web-rewrite.md
- `AnnouncementsPage Component` --semantically_similar_to--> `SlidersPage Component`  [INFERRED] [semantically similar]
  .superpowers/sdd/task-16-brief.md → .superpowers/sdd/task-15-brief.md
- `Task 22 Report: README & Deployment Docs` --implements--> `Umay Okçuluk Monorepo README`  [EXTRACTED]
  .superpowers/sdd/task-22-report.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Admin API Request Pipeline (guards + router + handlers)** — _superpowers_sdd_task_12_brief_build_api, _superpowers_sdd_task_12_brief_csrf_origin_guard, _superpowers_sdd_task_12_brief_session_guard, _superpowers_sdd_task_12_brief_router, _superpowers_sdd_task_10_brief_sliders_handler, _superpowers_sdd_task_11_brief_announcements_handler [EXTRACTED 0.75]
- **Admin SPA Shell Components** — _superpowers_sdd_task_14_brief_app_layout, _superpowers_sdd_task_14_brief_toast, _superpowers_sdd_task_14_brief_modal, _superpowers_sdd_task_14_brief_confirm_dialog [EXTRACTED 0.75]
- **Web Homepage Data + Render Flow** — _superpowers_sdd_task_19_brief_index_astro, _superpowers_sdd_task_19_brief_hero_slider, _superpowers_sdd_task_19_brief_announcement_card, _superpowers_sdd_task_18_brief_queries, _superpowers_sdd_task_17_brief_layout_astro [EXTRACTED 0.75]
- **Admin Login/Auth Request Pipeline** — _superpowers_sdd_task_9_brief_auth_handlers, _superpowers_sdd_task_6_brief_session, _superpowers_sdd_task_7_brief_ratelimit, _superpowers_sdd_task_8_brief_router [EXTRACTED 0.85]
- **Admin Security Posture** — _superpowers_sdd_task_5_brief_sanitizecontent, _superpowers_sdd_task_4_brief_isvalidimageurl, _superpowers_sdd_task_6_brief_session, _superpowers_sdd_task_7_brief_ratelimit [INFERRED 0.75]

## Communities (23 total, 3 thin omitted)

### Community 0 - "Admin API Handlers"
Cohesion: 0.08
Nodes (36): buildApi(), config, AnnBody, createAnnouncement(), deleteAnnouncement(), listAnnouncements(), parseId(), updateAnnouncement() (+28 more)

### Community 1 - "Admin SPA Components"
Cohesion: 0.06
Nodes (33): App(), Phase, AppLayoutProps, NAV_ITEMS, NavKey, ConfirmDialogProps, ModalProps, RichTextEditorProps (+25 more)

### Community 2 - "API Handlers & Routing (TDD)"
Cohesion: 0.05
Nodes (45): fakeSql Test Helper, isValidImageUrl, json Response Helper (router), Task 10: Slider CRUD Handlers (TDD), sliders.ts Handler Module, Sql Type (rateLimit), Task 10 Report, Task 11: Announcement CRUD Handlers (TDD) (+37 more)

### Community 3 - "Web Utils & Task Reports"
Cohesion: 0.07
Nodes (38): Task 20: About & Contact Pages (brief), Task 20 Report: About & Contact Pages, Task 21: Announcement Detail & Error Pages (brief), Task 21 Report: Announcement Detail & Error Pages, Task 22: README & Deployment Docs (brief), Task 22 Report: README & Deployment Docs, Task 3: makeSummary (brief), makeSummary (summary.ts) (+30 more)

### Community 4 - "Admin Dependencies"
Cohesion: 0.06
Nodes (31): dependencies, bcryptjs, jose, @neondatabase/serverless, react, react-dom, sanitize-html, @tiptap/extension-image (+23 more)

### Community 5 - "Astro Web Frontend"
Cohesion: 0.11
Nodes (18): ../components/AnnouncementCard.astro, ../components/Footer.astro, ../components/Header.astro, navLinks, ../components/HeroSlider.astro, ../layouts/Layout.astro, sql, formatDateTr() (+10 more)

### Community 6 - "Admin SPA Auth & Task Docs"
Cohesion: 0.10
Nodes (25): Session Guard (verifySessionToken), Task 13: Admin SPA Tokens + API Client + Auth + Login, SPA API Client (api.ts), App Phase State Machine (checking-login-panel), Design Tokens (tokens.css), Login.tsx Page, Cookie-only session (no localStorage), Task 13 Report (+17 more)

### Community 7 - "Web App Config & Deps"
Cohesion: 0.12
Nodes (15): dependencies, astro, @astrojs/netlify, @neondatabase/serverless, devDependencies, typescript, vitest, name (+7 more)

### Community 8 - "Admin TS Config"
Cohesion: 0.17
Nodes (11): compilerOptions, jsx, lib, module, moduleResolution, noEmit, skipLibCheck, strict (+3 more)

### Community 9 - "Session Module & Tests"
Cohesion: 0.38
Nodes (7): clearSessionCookie(), createSessionToken(), getSessionToken(), secret(), sessionCookie(), verifySessionToken(), fakeSql

### Community 10 - "Monorepo Scaffold & SDD Ledger"
Cohesion: 0.25
Nodes (9): Final Whole-Branch Review, Logo Placeholder Asset Gap, SDD Progress Ledger (umay-web-rewrite), Umay Web Rewrite Feature, Admin App (umay-admin, Vite + React), Task 1: Monorepo Scaffold + Admin App, npm Workspaces Monorepo, Task 1 Report (+1 more)

### Community 11 - "Root Workspace Config"
Cohesion: 0.33
Nodes (5): engines, node, name, private, workspaces

### Community 12 - "Admin Logo / Brand"
Cohesion: 0.67
Nodes (4): Umay Archery Sports Club Brand Identity, Stylized Bird of Prey Emblem, Traditional Turkish Bow Icon, Umay Okculuk Spor Kulubu Crest Logo

### Community 13 - "DB Migration Runner"
Cohesion: 0.50
Nodes (3): applied, dir, sql

### Community 14 - "Web Logo / Brand Identity"
Cohesion: 0.67
Nodes (4): Traditional Turkish Archery, Umay Deity Bird / Bow Emblem, Umay Okçuluk Spor Kulübü Logo, Umay Okçuluk Spor Kulübü (Archery Sports Club)

### Community 15 - "Web TS Config"
Cohesion: 0.50
Nodes (3): exclude, extends, include

## Knowledge Gaps
- **131 isolated node(s):** `config`, `AnnBody`, `DUMMY_HASH`, `SliderBody`, `sql` (+126 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `sliders.ts Handler Module` connect `API Handlers & Routing (TDD)` to `Admin SPA Auth & Task Docs`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `SlidersPage Component` connect `Admin SPA Auth & Task Docs` to `API Handlers & Routing (TDD)`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Are the 10 inferred relationships involving `Umay Web Rewrite Implementation Plan` (e.g. with `Task 20: About & Contact Pages (brief)` and `Task 21: Announcement Detail & Error Pages (brief)`) actually correct?**
  _`Umay Web Rewrite Implementation Plan` has 10 INFERRED edges - model-reasoned connections that need verification._
- **What connects `config`, `AnnBody`, `DUMMY_HASH` to the rest of the system?**
  _140 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin API Handlers` be split into smaller, more focused modules?**
  _Cohesion score 0.0847457627118644 - nodes in this community are weakly interconnected._
- **Should `Admin SPA Components` be split into smaller, more focused modules?**
  _Cohesion score 0.06285714285714286 - nodes in this community are weakly interconnected._
- **Should `API Handlers & Routing (TDD)` be split into smaller, more focused modules?**
  _Cohesion score 0.052525252525252523 - nodes in this community are weakly interconnected._