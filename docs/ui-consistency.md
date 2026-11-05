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
| `PAGE_GUTTER_X` | `{ base: 4, md: 6, lg: 8 }` | Same gutters as `<Container>`: 16 below md, 24 from md, 32 from lg. |
| `sizes.pageColumn` | `45rem` (720px) | The readable column of a single-column page (`READABLE_COLUMN_MAX_W`). Left-aligned on the logo line, never centred. |
| `sizes.statusCard` | `28rem` (448px) | The one width of every centred card, the auth card and the status, gate and error cards (`STATUS_CARD_MAX_W`). |

Page shells use **`<PageContainer>`** (`@ui`), not a hand-built `<Container>` or `maxW` / `mx` / `px` on a Box. Do not invent `7xl` / `1200px` page widths.

### Page layout rules (FE-493)

The site header's content box in the page container defines the **logo line** (left) and the **menu line** (right). `logoLineLeft(vw)` and `menuLineRight(vw)` in `src/theme/pageContainer.ts` give them (gutter plus half of what the window has beyond 80rem); the header is hidden below lg, but the gutters (16, 24 from md) are the same, so a page starts where it would under the header.

| Rule | What | Component |
| --- | --- | --- |
| R1 | Every page's content sits in the page container: 80rem, gutters 16 / 24 / 32, centred. | `PageContainer` |
| R2 | The page header (Back, the title, a description) starts on the logo line and spans the full container, at every width. | `PageLayout` (`StickyHeader`) |
| R3 | Single-column pages (Account, Billing, admin notifications, settings-style pages) keep a 720 column, LEFT-aligned on the logo line. | `PageLayout width="column"` |
| R4 | Wide pages (Profile, My tasks, task detail, lists, Messages) fill the container, with an optional rail. | `PageLayout width="wide"` |
| R5 | Full-bleed elements (maps, bands, covers, page backgrounds) go edge to edge; their content sits in the container. | `PageBleed` |
| R6 | Centred cards (auth forms, auth status pages, status, gate and error cards) stay centred, all at one width. | `StatusCard` (28rem) |
| R7 | Messages: from lg the inbox and chat panel sits inside the container gutters. | `PageContainer gutters="lg"` |

- **`PageContainer`** is Chakra's `Container` with `PAGE_CONTAINER_MAX_W` and `PAGE_GUTTER_X` set. `gutters`: `all` (default), `lg` (none below lg, for an inbox or a map that runs edge to edge on phones), `none`. **`PageBleed`** is the full-bleed form: an outer box that takes the background, border or media, with a `PageContainer` inside for the content.
- **`PageLayout`** brings its own `PageContainer`: do not wrap it in one. `width="column"` (default) puts the body in a 45rem column on the logo line; `width="wide"` uses the whole container, and `sidebar` adds a rail on the right from lg (stacked under the body below it, `sidebarOnMobile={false}` hides it there). `afterHeader` sits between the header and the body, in the column on a column page. The signed-in dashboard pages use it through `DashboardPageLayout`, which wires Back and its label.
- **`StatusCard`** is the card for status, gate and error screens: slots `logo`, `icon` (with `tone`) or `code`, `title`, `body` and `children`, `actions`, `footer`. `fullPage` makes it the whole page (a `main` filling the viewport, as the root 404 does); otherwise it is centred in the container of the page it is shown in. Width is 28rem (448): the width the status screens already had; the auth card was 416 (the shell's gutters took 32 out of the 448), so it moves to 448 when `AuthShell` puts its gutters outside the card. Spacing follows Foundations-Form-Spacing: header parts 20 apart, title to text 8, 24 to the actions, actions 8 apart.
- **No shared rail layout.** The existing two-column layouts are not one layout: three have the rail on the right (the dashboard `1.85fr / minmax(280px, 1fr)`, the public profile `1fr / 340px` with a sticky rail, task detail `2fr / 1fr`), the rest have it on the left (My tasks 19rem, the step flows 280 to 320 plus an aside, Messages 360 with a border) or over a map (Search 460). No rule R1 to R7 unifies them, and one component would either move pixels or be a `Grid` with the ratio, side, gap and stickiness all passed in. The rail `PageLayout` draws is the dashboard's, and stays inside it.
- **Step flows** (`StepFlowLayout`: post a task, edit task, send a quote, leave a review, worker setup). The flow header sits in `PageContainer` (R1, R2): Close and the logo start on the logo line. Below lg a step is one column (R3): `StepFlowColumn` caps the heading, fields and the action bar (`StepFlowActions inColumn`) at 45rem, LEFT-aligned on the logo line, with the page gutters (`STEP_FLOW_PX`: 16, 24 from md). The progress strip and the context region above it are bands that span the container (R5). From lg the stepper rail and the step panel fill the container; a rail + panel flow is not a single column, so R3 does not narrow it (Ryan to confirm, audit W9). The post-a-task map step keeps its compact card; its content, the band's area chip and the search field sit on the page gutters (the search field was 12 on phones, now 16). The gates in front of a flow (verify email, send a quote) are the centred `StatusCard` (R6, 448).
- Stories (`UI/PageContainer`, `UI/PageLayout`, `UI/StatusCard`) measure the logo line, the 720 column and the card width at 390, 820, 1024, 1366 and 1920 with play checks (`pageLines.testing.ts`).

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
| `@ui` layout | Drawer, Dropdown, Modal, MobileCarousel, StepFlowLayout, PageContainer, PageLayout, StatusCard | `UI/*` |
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
