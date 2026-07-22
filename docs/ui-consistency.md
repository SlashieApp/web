# Slashie UI Consistency Guide

Single source of truth for tokens, shells, primitives, and migration status for the
design-system modernization pass (FE-47). Quality bar: systematic variants (Uber Base),
trust-focused card hierarchy and whitespace (Airbnb) — while staying distinctly Slashie
(green `#00DC82`, map-first marketplace).

Last updated: 2026-07-17 · Owner: web  
**Architecture / layering:** see [Coding Guidebook](./coding-guidebook.md).

---

## 1. Token source of truth

| Concern | Canonical source | Notes |
| --- | --- | --- |
| Chakra-rendered UI | [`src/theme/chakraSystem.ts`](../src/theme/chakraSystem.ts) | `tokens` + `semanticTokens` for light/dark systems. **All component styling resolves here.** |
| Raw consumers (Mapbox, SVG, layout meta, stories) | [`src/theme/brand.ts`](../src/theme/brand.ts) | Plain string constants for code that cannot read Chakra tokens. Ramp **mirrors** the Chakra `primary` scale. |
| Server-safe re-export | [`src/theme/system.ts`](../src/theme/system.ts) | `export * from './brand'` + `./styles`. Import from here in server components. |

**Rule:** never hardcode a hex in feature code. Use a Chakra token (`primary`, `bg`,
`badgeBg`, etc.) inside components; use a `brand.ts` constant only for non-Chakra
consumers (map layers, static image URLs, `<meta theme-color>`).

### Colors

| Token | Light value | Use |
| --- | --- | --- |
| `primary` | `#00DC82` | Primary CTA fill, quotes/money/map accents. **Dark text only.** |
| `primaryHover` | `#00AB63` | Hover/active on primary surfaces. |
| `primary.500 / .600` | `#00DC82` / `#00AB63` | Ramp steps; `.600` for text/icon on light bg. |
| `bg` | `#F7F9F8` | App background. |
| `neutral.50 / .100` | `#FFFFFF` / `#F7F9F8` | Surfaces. |
| `neutral.900` | `#0B1714` | Primary text (ink). |
| `badgeBg / badgeFg` | `#D9F4E5` / `#00AB63` | Metadata chips. |

Brand green `#00DC82` with ink text `#0B1714` = **10.08:1** (passes WCAG AAA).
White text on green = 1.82:1 (**fails** — never use white text on green).

**Deprecated:** template blue `#1447E6` — never a primary CTA. Currently **0 usages** in `src/`.

### Type / radius / shadow

- Fonts: Plus Jakarta Sans (`heading`, marketing) · Inter (`body`, product UI).
- Radii: `sm 6` · `md 8` (buttons/inputs) · `lg 12` (cards) · `xl 16` (modals/cards).
- Shadows: `xs`–`xl` + semantic `card` (= `xs`), `primary` (green glow). Pick **soft shadow OR
  border** per card — not both.

---

## 2. Shells (route group → chrome)

Routes are already grouped by Next.js route groups, which align to shells:

| Route group | Shell | Chrome |
| --- | --- | --- |
| `src/app/(marketing)` — `/`, `/about`, `/pricing` | Marketing | Header only, footer; no sidebar/dock |
| `src/app/(auth)` — `/login`, `/register`, verify | Marketing (auth) | Header only, centered card |
| `src/app/(task)` — `/tasks`, `/tasks/[slug]` | Discovery / Task detail | Map+list, mobile bottom dock (max 4); detail = header + quote sidebar |
| `src/app/(dashboard)` — `/dashboard`, `/requests`, `/quotes`, `/billing`, `/account` | Dashboard | Icon sidebar + header |
| `src/app/(worker)` — `/worker/setup`, `/worker/plan`, `/workers/[slug]` | Standalone / Dashboard | Setup = standalone (no dashboard chrome) |

**Active-nav rule:** active state uses green accent; icon + label aligned.

---

## 3. Primitive inventory (`src/ui`) + shell

Pages import primitives from `@ui` (barrel auto-generated — `bun run exports-gen`).  
**App shell** (`Header`, `Dock`) also lives under **`src/ui`** with colocated `i11n.json` — see [Coding Guidebook](./coding-guidebook.md) §2.

| Layer | Modules | Story title |
| --- | --- | --- |
| `@ui` controls | Button, Input, Textarea, Select, PhoneInput, OtpInput, FormField, RadioButton, Slider, IconButton | `ui/*` |
| `@ui` display | Card, Badge, Avatar, Thumbnail, Rating, DetailRow, InfoBar, Toast, ProgressBar, Stepper, Tabs, ScheduleChip, SpotIllustration, MapCard, ImageGallery, Logo, Link | `ui/*` |
| `@ui` layout | Drawer, Dropdown, Modal, MobileCarousel, StepFlowLayout, Footer | `ui/*` |
| `@ui` shell | Header, Dock | `ui/*` |
| `@ui` presentational + adapter | LanguageSwitcher (`src/ui`) + connected `src/i18n/LanguageSwitcher.tsx` | `ui/LanguageSwitcher` |

**Not in `@ui` (by design)**

- Marketplace EmptyState — compose `SpotIllustration` + copy/CTA in the feature.
- Task status pills — feature adapter (`TaskStatusPill`) over `Badge`.
- Current-user avatar — `MeAvatar` adapter over `Avatar` (`srcCandidates` / icon fallback).

Docs foundations: `src/ui/_foundations/*` (Color, Typography, …).

---

## 4. Violations found (Phase 0 audit)

| Severity | Finding | Location | Status |
| --- | --- | --- | --- |
| High | Brand green ramp in `brand.ts` diverged from Chakra (`#00AB63` as primary) | `src/theme/brand.ts` | ✅ Fixed — ramp now mirrors Chakra, primary `#00DC82` |
| Med | Hardcoded `#00AB63` in map pin/route/static-image | `taskMap/pin`, `navRoute.ts`, `mapboxStaticImageUrl.ts`, `TaskLocationMapPicker.tsx` | ✅ Fixed — routed through `BRAND_MAP_*` constants (visible: pins now brighter spec green) |
| Low | Ad-hoc hex gradients in marketing hero | `src/app/(marketing)/page.tsx:465,608` | Open — marketing decorative; tokenize later |
| Low | Direct `@chakra-ui/react` primitive import | `(worker)/worker/setup/components/WorkerSetupHeader.tsx` | Open — review during worker migration |
| Info | Shared Empty primitive intentionally not in `@ui` | features compose `SpotIllustration` | ✅ By design — see Coding Guidebook |
| Info | Toast exists in `@ui` | `src/ui/Toast` | ✅ |

No primary blue CTAs found. ~15 ad-hoc hex values total across `src/app/**` (mostly map/marketing decorative).

---

## 5. Migration checklist (priority order)

- [ ] **Auth** — `/login`, `/register`, verify banners → primitives + Alert
- [ ] **Discovery** — `/tasks` browse, filters, task cards, map chrome
- [ ] **Task detail** — `/tasks/[slug]`, quote sidebar, CTAs
- [ ] **Worker** — setup, `/worker/plan`, billing, `/pricing`
- [ ] **Customer** — `/requests`, post-task flow
- [ ] **Legal** — `/privacy`, `/terms`, `/cookies` (FE-65) — prose layout + footer

Per route: replace inline UI with primitives → confirm correct shell → remove dead CSS.

## 6. Do / Don't

- ✅ Dark ink text on green. ❌ White text on green.
- ✅ Green for action/quotes/money/map pins. ❌ Green for large background fills.
- ✅ One card pattern sitewide (border **or** soft shadow). ❌ Both at once.
- ✅ Tokens via `@ui` primitives / Chakra tokens. ❌ Inline `style`/hardcoded hex in pages.
- ✅ Motion 150–200ms, respect `prefers-reduced-motion`. ❌ `#1447E6` as a primary CTA.
- ✅ 44px min touch targets on mobile primary actions; visible focus rings.
