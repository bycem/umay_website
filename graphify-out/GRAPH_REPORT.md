# Graph Report - .  (2026-07-18)

## Corpus Check
- 8 files · ~56,588 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 401 nodes · 573 edges · 26 communities (22 shown, 4 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 43 edges (avg confidence: 0.87)
- Token cost: 20,000 input · 10,000 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Admin API & Auth|Admin API & Auth]]
- [[_COMMUNITY_Admin React App & Layout|Admin React App & Layout]]
- [[_COMMUNITY_Netlify CRUD Handlers|Netlify CRUD Handlers]]
- [[_COMMUNITY_Task Reports & Summaries|Task Reports & Summaries]]
- [[_COMMUNITY_Architecture & Security|Architecture & Security]]
- [[_COMMUNITY_Admin package.json|Admin package.json]]
- [[_COMMUNITY_Web Astro Components|Web Astro Components]]
- [[_COMMUNITY_Web App Scaffold|Web App Scaffold]]
- [[_COMMUNITY_Announcements Handler|Announcements Handler]]
- [[_COMMUNITY_Web package.json|Web package.json]]
- [[_COMMUNITY_Admin tsconfig|Admin tsconfig]]
- [[_COMMUNITY_SDD Ledger & Reviews|SDD Ledger & Reviews]]
- [[_COMMUNITY_Root package.json|Root package.json]]
- [[_COMMUNITY_Umay Brand Identity|Umay Brand Identity]]
- [[_COMMUNITY_Migrate Script|Migrate Script]]
- [[_COMMUNITY_Umay Archery Concept|Umay Archery Concept]]
- [[_COMMUNITY_Web tsconfig|Web tsconfig]]
- [[_COMMUNITY_Create Admin Script|Create Admin Script]]
- [[_COMMUNITY_HTML Sanitization|HTML Sanitization]]
- [[_COMMUNITY_Web db.ts|Web db.ts]]
- [[_COMMUNITY_Design Tokens|Design Tokens]]
- [[_COMMUNITY_Rate Limiting|Rate Limiting]]

## God Nodes (most connected - your core abstractions)
1. `json()` - 18 edges
2. `apps/admin` - 18 edges
3. `Sql` - 15 edges
4. `Umay Web Rewrite Implementation Plan` - 11 edges
5. `login()` - 10 edges
6. `compilerOptions` - 10 edges
7. `../layouts/Layout.astro` - 10 edges
8. `apps/web` - 10 edges
9. `announcements.ts Handler Module` - 8 edges
10. `SlidersPage Component` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Task 20: About & Contact Pages (brief)` --conceptually_related_to--> `Umay Web Rewrite Implementation Plan`  [INFERRED]
  .superpowers/sdd/task-20-brief.md → docs/superpowers/plans/2026-07-04-umay-web-rewrite.md
- `Task 21: Announcement Detail & Error Pages (brief)` --conceptually_related_to--> `Umay Web Rewrite Implementation Plan`  [INFERRED]
  .superpowers/sdd/task-21-brief.md → docs/superpowers/plans/2026-07-04-umay-web-rewrite.md
- `Task 22: README & Deployment Docs (brief)` --conceptually_related_to--> `Umay Web Rewrite Implementation Plan`  [INFERRED]
  .superpowers/sdd/task-22-brief.md → docs/superpowers/plans/2026-07-04-umay-web-rewrite.md
- `Layout.astro` --semantically_similar_to--> `Design Tokens (tokens.css)`  [INFERRED] [semantically similar]
  .superpowers/sdd/task-17-brief.md → .superpowers/sdd/task-13-brief.md
- `Admin SPA HTML Entry (index.html)` --conceptually_related_to--> `Two-App Isolation Architecture`  [INFERRED]
  apps/admin/index.html → docs/superpowers/specs/2026-07-04-umay-web-rewrite-design.md

## Import Cycles
- None detected.

## Communities (26 total, 4 thin omitted)

### Community 0 - "Admin API & Auth"
Cohesion: 0.10
Nodes (33): buildApi(), config, DUMMY_HASH, login(), logout(), me(), createSlider(), deleteSlider() (+25 more)

### Community 1 - "Admin React App & Layout"
Cohesion: 0.06
Nodes (33): App(), Phase, AppLayoutProps, NAV_ITEMS, NavKey, ConfirmDialogProps, ModalProps, RichTextEditorProps (+25 more)

### Community 2 - "Netlify CRUD Handlers"
Cohesion: 0.05
Nodes (47): fakeSql Test Helper, isValidImageUrl, json Response Helper (router), Task 10: Slider CRUD Handlers (TDD), sliders.ts Handler Module, Sql Type (rateLimit), Task 10 Report, Task 11: Announcement CRUD Handlers (TDD) (+39 more)

### Community 3 - "Task Reports & Summaries"
Cohesion: 0.07
Nodes (37): Task 20: About & Contact Pages (brief), Task 20 Report: About & Contact Pages, Task 21: Announcement Detail & Error Pages (brief), Task 21 Report: Announcement Detail & Error Pages, Task 22: README & Deployment Docs (brief), Task 22 Report: README & Deployment Docs, Task 3: makeSummary (brief), makeSummary (summary.ts) (+29 more)

### Community 4 - "Architecture & Security"
Cohesion: 0.07
Nodes (36): admin_users table, AppLayout.tsx, apps/admin, apps/web, Astro, bcrypt, Content-Security-Policy, db:create-admin script (+28 more)

### Community 5 - "Admin package.json"
Cohesion: 0.06
Nodes (31): dependencies, bcryptjs, jose, postgres, react, react-dom, sanitize-html, @tiptap/extension-image (+23 more)

### Community 6 - "Web Astro Components"
Cohesion: 0.11
Nodes (17): ../components/AnnouncementCard.astro, ../components/Footer.astro, navLinks, ../components/HeroSlider.astro, ../layouts/Layout.astro, sql, formatDateTr(), Announcement (+9 more)

### Community 7 - "Web App Scaffold"
Cohesion: 0.09
Nodes (23): Astro Netlify Adapter (output: server), Footer.astro, Header.astro, Layout.astro, Web App (umay-web, Astro SSR), Task 17: Web App Scaffold (Astro + Layout + Header + Footer), Task 17 Report, queries.ts (getActiveSliders, getRecentAnnouncements, getAnnouncementById) (+15 more)

### Community 8 - "Announcements Handler"
Cohesion: 0.20
Nodes (10): AnnBody, createAnnouncement(), deleteAnnouncement(), listAnnouncements(), parseId(), updateAnnouncement(), validateAnn(), sanitizeContent() (+2 more)

### Community 9 - "Web package.json"
Cohesion: 0.12
Nodes (15): dependencies, astro, @astrojs/netlify, postgres, devDependencies, typescript, vitest, name (+7 more)

### Community 10 - "Admin tsconfig"
Cohesion: 0.17
Nodes (11): compilerOptions, jsx, lib, module, moduleResolution, noEmit, skipLibCheck, strict (+3 more)

### Community 11 - "SDD Ledger & Reviews"
Cohesion: 0.25
Nodes (9): Final Whole-Branch Review, Logo Placeholder Asset Gap, SDD Progress Ledger (umay-web-rewrite), Umay Web Rewrite Feature, Admin App (umay-admin, Vite + React), Task 1: Monorepo Scaffold + Admin App, npm Workspaces Monorepo, Task 1 Report (+1 more)

### Community 12 - "Root package.json"
Cohesion: 0.33
Nodes (5): engines, node, name, private, workspaces

### Community 13 - "Umay Brand Identity"
Cohesion: 0.67
Nodes (4): Umay Archery Sports Club Brand Identity, Stylized Bird of Prey Emblem, Traditional Turkish Bow Icon, Umay Okculuk Spor Kulubu Crest Logo

### Community 14 - "Migrate Script"
Cohesion: 0.50
Nodes (3): applied, dir, sql

### Community 15 - "Umay Archery Concept"
Cohesion: 0.67
Nodes (4): Traditional Turkish Archery, Umay Deity Bird / Bow Emblem, Umay Okçuluk Spor Kulübü Logo, Umay Okçuluk Spor Kulübü (Archery Sports Club)

### Community 16 - "Web tsconfig"
Cohesion: 0.50
Nodes (3): exclude, extends, include

### Community 18 - "HTML Sanitization"
Cohesion: 0.67
Nodes (3): sanitize-html, netlify/lib/sanitize.ts, TipTap editor

## Knowledge Gaps
- **152 isolated node(s):** `config`, `AnnBody`, `DUMMY_HASH`, `SliderBody`, `Handler` (+147 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `sliders.ts Handler Module` connect `Netlify CRUD Handlers` to `Web App Scaffold`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `DB Schema (sliders, announcements, login_attempts)` connect `Web App Scaffold` to `Netlify CRUD Handlers`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Are the 10 inferred relationships involving `Umay Web Rewrite Implementation Plan` (e.g. with `Task 20: About & Contact Pages (brief)` and `Task 21: Announcement Detail & Error Pages (brief)`) actually correct?**
  _`Umay Web Rewrite Implementation Plan` has 10 INFERRED edges - model-reasoned connections that need verification._
- **What connects `config`, `AnnBody`, `DUMMY_HASH` to the rest of the system?**
  _163 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin API & Auth` be split into smaller, more focused modules?**
  _Cohesion score 0.09879336349924585 - nodes in this community are weakly interconnected._
- **Should `Admin React App & Layout` be split into smaller, more focused modules?**
  _Cohesion score 0.06285714285714286 - nodes in this community are weakly interconnected._
- **Should `Netlify CRUD Handlers` be split into smaller, more focused modules?**
  _Cohesion score 0.0545790934320074 - nodes in this community are weakly interconnected._