# Slashie UI Consistency Guide

Single source of truth for tokens, shells, primitives, and migration status for the
design-system modernization pass (FE-47). Quality bar: systematic variants (Uber Base),
trust-focused card hierarchy and whitespace (Airbnb) — while staying distinctly Slashie
(green `#00DC82`, map-first marketplace).

Last updated: 2026-10-28 · Owner: web
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
| `bg` | `#FAFAFA` | App background. |
| `neutral.0 / .50 / .100` | `#FFFFFF` / `#FAFAFA` / `#F4F4F5` | Surface, canvas, subtle fill. The neutral ramp is zinc (FE-469); only the ink keeps its green undertone. |
| `neutral.900` | `#0A1512` | Primary text (ink). |
| `badgeBg / badgeFg` | `#D9F4E5` / `#00AB63` | Metadata chips. |

Brand green `#00DC82` with ink text `#0A1512` = **10.24:1** (passes WCAG AAA).
White text on green = 1.82:1 (**fails** — never use white text on green).

Light roles (FE-469): `text.muted` `#52525B`, `text.subtle` `#6B6B74` (5.1:1 on `#FAFAFA`, 4.8:1 on `#F4F4F5`),
`border.default` `#E4E4E7`, `border.strong` `#D4D4D8`, `border.hover` `#A1A1AA`. Tags take a 1px border
from their family (`status.<family>.border`); categories are neutral. Green does a job (the main
action, links, focus, active bars, state, map pins, selected states), never decoration: see
Foundations/Color. Three rules follow from it (FE-469): a hover or press tint is `bg.subtle`, never
mint (mint stays on a selected chip, row or tile); green 400 is a fill, so an active or selected
border, a connector and the spinner arc are `accent.active` (green 600) and the price on a white map
pin is green 800 (`#05683F`); and the mobile bottom nav's active tab is ink (`text.default`, 500)
with the others `text.subtle`, so the Post task button is its only green.

**Deprecated:** template blue `#1447E6` — never a primary CTA. Currently **0 usages** in `src/`.

### Page column

| Token | Value | Use |
| --- | --- | --- |
| `sizes.page` | `80rem` (Chakra `8xl`) | Default `<Container>` max width, the header's width (`PAGE_CONTAINER_MAX_W`). Every page's content container uses it (FE-453); full-width maps, bands and backgrounds stay edge to edge. |
| `PAGE_CONTAINER_MAX_W` | `'page'` | Box/Grid overlays that cannot be a `<Container>`. |
| `PAGE_GUTTER_X` | `{ base: 4, md: 6, lg: 8 }` | Same gutters as `<Container>`. |

Page shells use **`<Container>`** with no `maxW` override. Do not invent `7xl` / `1200px` page widths.

Marketing pages sit in the marketing frame (FE-471, `src/app/(marketing)/components/layout/MarketingFrame.tsx`):
a white page, from `lg` a 1px `border.default` rail down each side of this same page column, a full-width
1px rule between sections (`SectionRule`), a left-aligned section head with a green 600 icon and an
eyebrow (`SectionHead`), and section padding from `SECTION_PY` (56px phone to 128px wide). Only the hero
and the closing call to action are centred. `/home`, `/pricing`, `/about` and the legal pages (`/terms`,
`/privacy`, `/cookies`, `/help/safety`, one `LegalPageLayout`: rows with the heading beside the text in a
32em reading column) are in the frame so far (the marketing header is white on those routes,
`FRAMED_ROUTES`); a page whose sticky page header paints an opaque bar passes `railsZIndex` so the rails
run over it. One green fill per screen holds on marketing too: the header's Get started is secondary while the
page's own green action (the hero's Search, the closing Post a task, the paid plan's action; the button carries
`data-page-green-action`) is in view (`pageGreenWatch`), and the green one again when none is.

### Type / radius / shadow

- Fonts: Geist (`heading`, `body`, `display`) · Geist Mono (`mono`), loaded with `next/font` in
  `src/app/layout.tsx`; the variables sit on `<html>`, so the Chakra font tokens resolve (FE-468).
  Headings are weight 500 with tracking by size (the `Heading` recipe); prices, counts and other
  figures are 600 with tabular figures (`sdlFigure`); no 700 or 800 anywhere. The type roles
  (`display-2xl` to `mono-sm`, and `eyebrow` for uppercase labels) live in `sdlTypeScale`.
- Radii: `sm 6` · `md 8` (inputs, selects, text areas) · `lg 12` (cards, dialogs) · `xl 16` (panels, map cards, dropdown panels) · `2xl 20` (full-height brand panes only) · `full` (buttons, icon buttons, chips, tags, badges, search fields, map price pins).
- Shadows: SDL `e1`–`e5` (`src/theme/styles.ts` `sdlElevation`, two layers each). Card recipe (`sdlCard`):
  **rest `e1`** · **raised `e2`** · **map overlay `e3`**. Hairline `border.default` + rest
  shadow together (see Foundations/Elevation). `e3` and `e4` carry their own 1px ring, so a
  surface on them (menus, floating chrome, drawers) has no border of its own. Do not use raw
  `box-shadow` strings or the leftover Chakra `sm`/`md`/`card` aliases in feature code.
- Sections on phones and tablets (FE-312): `Card layout="section"` drops its frame below
  `lg` (1024px) and sits on the page, with a hairline between consecutive sections. Desktop
  keeps the card. Plain cards (list rows, map pins, popups, heroes) and interactive cards keep
  their frame. Pass `framed` to keep a section's box on every width, for example when it brings
  its own colour.

---

## 2. Shells (route group → chrome)

Routes are already grouped by Next.js route groups, which align to shells:

| Route group | Shell | Chrome |
| --- | --- | --- |
| `src/app/(marketing)` — `/`, `/about`, `/pricing` | Marketing | Header only, footer; no sidebar/dock |
| `src/app/(auth)`: `/login`, `/register`, verify | Marketing (auth) | Logo row with a back arrow (Log in only when something is behind it), centered card, legal links |
| `src/app/(task)` — `/search`, `/tasks` (My Tasks hub), `/tasks/[slug]` | Discovery / My Tasks / Task detail | Map browse on `/search`; hub list on `/tasks`; mobile bottom dock (4); detail = header + quote sidebar |
| `src/app/(stepflow)` — `/tasks/create`, `/tasks/[slug]/quote`, `/tasks/[slug]/review`, `/worker/setup` | StepFlow | Own route-group `layout.tsx`, no app `Header` / `Dock` (FE-78). Every flow uses `StepFlowHeader`; quote, review, edit and worker setup (six screens, the standard phone body, FE-296) use `StepFlowLayout`; create uses its map variant `CreateTaskMapLayout` (full-screen map, then the band) with the same heading, progress and action bar (FE-295) |
| `src/app/(dashboard)`: `/profile`, `/account`, `/billing` | Settings | App header, no bottom nav; the page header (FE-458, below): h1 = menu label, Back at every width |
| `src/app/(worker)`: `/workers` (and the `/workers/[id]` redirect to `/profile/[userId]`) | App | Header chrome; below lg no bottom nav and a back arrow over the map (setup lives under `(stepflow)`) |

**Active-nav rule:** active state uses green accent; icon + label aligned.

**Nav-page rule (FE-445):** below lg the bottom nav shows on its own pages only: Search, My tasks and Messages. Every other page has a back arrow (Close on a step flow) and no bottom nav (`shouldHideMobileNav`). The public pages (Pricing, Terms, Privacy, Cookies, Safety) keep the website header, and the page header's bar carries their back arrow. Back goes to the page before, or with nothing behind it to Search signed in and the home page for a visitor (`useGoBack`).

### Page header (FE-458)

One header for Account, Plan & billing, Pricing, Terms, Privacy, Cookies, Safety, Profile, admin notifications, task details and a public profile: `StickyHeader` (`@ui`), which wraps the page. The same numbers drive the app's header (FE-459); they live in `src/ui/StickyHeader/headerCollapse.ts`.

- **Bar:** one 56px row that sticks to the top of the page (`stickyTop` under the marketing header; the app shell's pane is already under the app header). Its row lines up with the page's column and gutters (16 / 24 / 32), its fill is the page's own colour, with no rule or shadow. Back is on the left at every width (a 44px box, the 24px glyph on the content's left edge; over a map or cover see below); a page's own icon button goes on the right (`option`, such as the task options). Labelled buttons stay in the page.
- **Big title:** under the bar, 34px, 500, -0.03em, line height 1.2, the page's one h1, 8px under the bar, then the description. As the page scrolls it moves up and shrinks to 18px beside Back over 48px of scroll, and over the last quarter cross-fades into the bar's one-line copy (18px, 500, -0.01em, ellipsis, hidden from screen readers). Scrolling back up reverses it; with `prefers-reduced-motion` nothing interpolates and the copy shows at once 48px in.
- **Over a map or cover (`overMedia`: task details, a public profile, its loading state):** the bar floats over it with Back and the option button as frosted round chips (`HEADER_OVERLAY_BUTTON`), transparent until the title reaches it, then fading to the page colour. The chips sit inside the margin: Back's 44px chip runs from the content's left edge, the option chip ends on its right edge, so nothing sticks out past the content or the card. The bar's copy then starts at content left + 52 (the chip and 8px) and ends 8px before the option chip (content right - 52, or on the content's right edge with no option), and the title collapses to that x; a plain bar keeps the glyph on the edge and the copy at content left + 40. The title rests lower, under the map or cover: the page renders it with `StickyHeaderTitle`, and the header finds it.
- **Long task titles (task details only):** the big title shows at most 3 lines and ends with an ellipsis. A title that is longer is a toggle (click, Enter or Space, `aria-expanded`) that shows the whole title and folds it back; a short one is plain text. The h1 always holds the whole title (it is still the one h1), the title moving into the bar follows what is shown, and the bar's copy is one line with an ellipsis either way. Opening it pushes the content below down. `StickyHeader` takes `titleMaxLines`; task details passes `TASK_TITLE_MAX_LINES`.
- **Tab and reading order:** follows the bar's row: Back, the option button (when the page has one), then the page, big title first. The bar's one-line copy is hidden from screen readers.


---

## 3. Primitive inventory (`src/ui`) + shell

Pages import primitives from `@ui` (barrel auto-generated — `bun run exports-gen`).
**App shell** (`Header`, `Dock`) also lives under **`src/ui`** with colocated `i11n.json` — see [Coding Guidebook](./coding-guidebook.md) §2.

| Layer | Modules | Story title |
| --- | --- | --- |
| `@ui` controls | Button, Input, Textarea, Select, PhoneInput, OtpInput, FormField, RadioButton, Slider, IconButton | `UI/*` |
| `@ui` display | Card, Badge, Avatar, Thumbnail, Rating, DetailRow, InfoBar, Toast, ProgressBar, Stepper, Tabs, ScheduleChip, SpotIllustration, MapCard, ImageGallery, Logo, Link | `UI/*` |
| `@ui` layout | Drawer, Dropdown, Modal, MobileCarousel, StepFlowLayout | `UI/*` |
| `@ui` shell | Header, Footer, MobileBottomNav | `Shell/*` |
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
| Low | Direct `@chakra-ui/react` primitive import | `(stepflow)/worker/setup/components/WorkerSetupHeader.tsx` | ✅ Gone — every flow uses `@ui` `StepFlowHeader` (FE-296) |
| Info | Shared Empty primitive intentionally not in `@ui` | features compose `SpotIllustration` | ✅ By design — see Coding Guidebook |
| Info | Toast exists in `@ui` | `src/ui/Toast` | ✅ |

No primary blue CTAs found. ~15 ad-hoc hex values total across `src/app/**` (mostly map/marketing decorative).

---

## 5. Migration checklist (priority order)

- [ ] **Auth** — `/login`, `/register`, verify banners → primitives + Alert
- [ ] **Discovery** — `/tasks` browse, filters, task cards, map chrome
- [ ] **Task detail** — `/tasks/[slug]`, quote sidebar, CTAs
- [ ] **Worker** — setup, billing, `/pricing`
- [ ] **Customer** — `/tasks` hub, post-task flow
- [ ] **Legal** — `/privacy`, `/terms`, `/cookies` (FE-65) — prose layout + footer

Per route: replace inline UI with primitives → confirm correct shell → remove dead CSS.

## 6. Do / Don't

- ✅ Dark ink text on green. ❌ White text on green.
- ✅ Green for action/quotes/money/map pins. ❌ Green for large background fills.
- ✅ One card recipe sitewide (`lg` + hairline + `e1`/`e2`/`e3`). ❌ Ad-hoc `2xl` cards or raw shadows.
- ✅ Tokens via `@ui` primitives / Chakra tokens. ❌ Inline `style`/hardcoded hex in pages.
- ✅ Motion 150–200ms, respect `prefers-reduced-motion`. ❌ `#1447E6` as a primary CTA.
- ✅ 44px min touch targets on mobile primary actions; visible focus rings.
