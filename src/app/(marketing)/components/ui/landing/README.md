# Slashie marketing landing

`/home`: a scroll story that introduces Slashie. A fixed white page with
floating real-time 3D objects (toolbox, mop bucket, boxes, paint roller,
screwdriver, map pin) sits behind a server-rendered narrative, and an HTML
phone demos the real app as you scroll. Lives inside the production app
(Chakra v3 + SDL tokens): **no Tailwind, no styling-system fork** (FE-205).

## Run / build

```bash
bun install
bun run dev        # http://localhost:3000/home
bun run build
```

## Story

| Stage | Copy (`landing.story`) | Phone screen | 3D formation |
| --- | --- | --- | --- |
| `hero` | hero heading + search CTA | Search (customer) | `hero`: around the phone |
| `post` · `quotes` · `chat` · `hire` · `review` | customer act | Post · Quotes · Chat · Hire · Review | `customer`: right half |
| `workerFind` · `workerQuote` · `workerProfile` | worker act | Search (worker) · Quote form · Profile | `worker`: tools forward |
| `trust` · `pricing` | trust panel, live pricing | (phone has left) | `scatter`: right side |
| `cta` | Post a task / Become a worker | | `gather`: around the CTA |

Each step also pulls one "focus" object beside the phone (`formations.ts`).

## Architecture

```
home/page.tsx                server shell: metadata, live pricing, section order
components/ui/landing/
  LenisRoot.tsx              smooth scroll (skipped under reduced motion)
  Reveal.tsx · Magnetic.tsx  scroll reveal (fade, 8px rise, 400ms, once) · magnetic CTA
  hooks/useDeviceTier.ts     high | mid | low | off (off = reduced motion / no WebGL)
  hero/HeroSection.tsx       the centred hero: h1, body, search pill, trust checks, how-it-works link
  hero/HeroSearchCta.tsx     the 52px search pill + green Search pill (hands the text to /search)
  story/
    storyState.ts            module store: active stage, pointer, scene-ready
    StoryTracker.tsx         stage markers + IntersectionObserver on the viewport middle
    LandingStory.tsx         hero, both acts, the pinned phone track (desktop)
  phone/
    PhoneFrame.tsx           device chrome; 375x812 screens scaled to the frame width
    PhoneDemo.tsx            stage -> screen; StickyPhone (desktop) / StepPhone (inline)
    screens/*                one scripted beat per screen (useDemoBeat: tap or autoplay)
    PhoneMap.tsx             drawn London map + the app's price pins
  scene/
    LandingBackdrop.tsx      fixed white page + lazy three.js scene (next/dynamic, ssr: false)
    LandingScene.tsx         Canvas, lightformer reflections, damped formation moves
    formations.ts            poses per formation (viewport fractions), unit-tested
    objects/*                procedural models (drei RoundedBox, lathe/extrude/tube geometry)
    HeroObjectsPoster.tsx    still render of the hero objects (public/images/landing/)
  showcase/
    MapShowcase.tsx          the map panel: drawn map, price pins, the selected task's card
    mapShowcaseModel.ts      pure: demo tasks from landing.phone, pin spots per layout, collision maths
    mapShowcaseArt.ts        pure: the drawn map's shapes (river, roads, parks, streets)
  bento/
    BentoSection.tsx         the bento: three hairline-divided cells, each a step and its snippet
    BentoSnippets.tsx        the three live snippets: post form, quote rows, accepted row
    useSnippetEntrance.ts    the snippets' once-only entrance (static | waiting | playing)
  sections/                  TrustSection · PricingTeaser · FinalCtaBand
```

## Frame and rhythm

The page is white (`bg.surface`; the backdrop paints it behind the 3D scene).
The shared frame lives in `../layout/MarketingFrame.tsx` and every marketing
section builds on it:

- `MarketingFrame` wraps the sections (not the footer): from `lg` it draws a
  1px `border.default` rail down each side of the page column (`sizes.page`,
  the same measure as `<Container>` and the header) for the full height.
- `SectionRule` is a full-width 1px rule between two sections; it runs across
  the rails. `home/page.tsx` puts one between each section it assembles (and
  around the map panel it passes to `LandingStory`).
- `SectionHead` is the left-aligned section head: a small green 600 icon and
  the eyebrow, then the heading (34/41 on a phone, 44/48 from `lg`, 500) and
  an optional body. Only the hero and the closing call to action are centred.
- `SECTION_PY` is the section's vertical padding: 56px on a phone, 80 on a
  tablet, 96 on a laptop, 128 on a wide screen.
- Motion: `Reveal` fades in with an 8px rise over 400ms on the decelerate
  curve, once. Reduced motion (and no JS) shows the content as it is.

## Hero

The one centred section (`hero/HeroSection.tsx`), built from tokens only:

- The h1 is `display-2xl` (72/72 at 500, -0.045em; 44/46 on a phone) with
  `text-wrap: balance`; the body is `text-lg` in `text.muted`, also balanced.
- The search is one 52px pill (`HeroSearchCta`, the `Input` primitive with
  `pill`: a 1px `border.strong` hairline, `border.focus` ring on focus, a
  `text.subtle` placeholder) with the green Search pill inside it. That pill is
  the hero's only green fill; the header's Get started stays secondary over it.
- The trust row is a list: a green 600 check (`accent.active`) and the text in
  `text.muted`. "See how it works" is a `text.link` text action that underlines
  on hover and focus (never green 400).
- A faint radial grey (`bg.subtle` fading to nothing, `data-hero-glow`) sits
  behind the top of the page. It starts under the sticky header so there is no
  seam, and it is painted under the still poster.
- The entrance is the `fade-rise` keyframe (a fade with an 8px rise, 400ms on
  the decelerate curve, once, staggered 60ms); reduced motion turns it off. The
  older `rise-in` keyframe (28px) still serves the phone screens.

## Map panel

The interactive map panel (`showcase/MapShowcase.tsx`) sits between the hero and
the first act. `home/page.tsx` passes it to `LandingStory` as `showcase`, between
two `SectionRule`s, so the order is hero, panel, then the phone and the acts (on
both layouts). It belongs to no story stage: the scene stays in the hero
formation while it passes, and the panel is opaque (`bg.canvas`).

- **The map** is drawn, not tiled: an SVG in neutral tokens only (`bg.subtle`
  land, `border.default` parks and road casings, `border.strong` river,
  `bg.surface` streets). No green, no mint, no network, no Mapbox. The shapes are
  data in `mapShowcaseArt.ts`; the SVG is one canvas that the map box crops
  (`slice`, centred), the river down the middle so every crop keeps it.
- **The map box** is as wide as the page column (80rem) and keeps an aspect
  ratio per breakpoint (9:10 on a phone, 3:2 from `sm`, 9:5 from `md`, 11:5 from
  `lg`; `MAP_ASPECT`), so it works from 390 to 1920 wide.
- **Pins** are real buttons named by `landing.phone.search.selectPin` ("Show the
  £45 task"), with `aria-pressed` for the selection, in reading order (top to
  bottom, both layouts). A pin is a white pill with a 1px `border.default`
  hairline, `e1`, and the price in green 800 at 600 with tabular figures; the
  selected one is green 400 with an ink price and `e3`. The area sits under the
  dot as a quiet map label. Focus is a green 600 ring round the pill. Hover steps
  the hairline to `border.hover`.
- **The card** is a lightweight replica of the product's `TaskCard` (which reads
  the API and the router): `Card` (12px, hairline, `e1`), a neutral tile, a
  neutral `Badge` with the area, the title at 500 / -0.01em, the price in ink at
  600 with tabular figures and the muted meta. From `md` it floats over the map's
  bottom-left corner (20px inset, 380px); below `md` it sits under the map. It is
  an `aria-live="polite"` region, so a change of pin is announced.
- **Pin spots** (`PIN_SPOTS`, fractions of the map box) differ per layout: the
  narrow one uses the whole map, the wide one keeps clear of the card. The title
  chip ("Tasks near you", the section's h2, `landing.phone.search.workerPlaceholder`)
  takes the top-left. `mapShowcaseModel.test.ts` checks, at every width from 320
  to 1920, that no two pins touch and none sits under the card or the chip.
- **Copy:** none added. The tag on the card is the task's area, because the
  phone bag has a category for one task only; the quote count is the bag's
  `{count} quotes` (so "1 quotes", as the phone shows it).
- **Motion:** pins ease their fill and lift over 200ms; a new card fades in with
  an 8px rise over 300ms, only after the visitor picks a pin. Reduced motion
  turns both off (the selection then cuts); the section's own reveal is `Reveal`.

## Bento

The bento (`bento/BentoSection.tsx`) is the customer's first three steps as
three cells divided by hairlines: "Post a task in a minute", "Compare quotes"
and "Hire and pay directly" (`landing.story.customer.steps`, title and body as
they are). `home/page.tsx` passes it to `LandingStory` in the `showcase` slot,
after the map panel, with a `SectionRule` on each side, so the order is hero,
map panel, bento, then the phone and the acts (on both layouts). It belongs to
no story stage, and it is opaque (`bg.surface`): the 3D scene stays behind it,
so a prop never crosses a title or a row.

- **Layout.** From `lg` the three cells sit side by side across the page column
  (`sizes.page`), divided by 1px `border.default` lines that run from rule to
  rule; the first cell has none, because the frame's rail is on that edge. The
  cells share their rows (a CSS subgrid: `gridTemplateRows: subgrid`), so the
  three panels start on one line whatever the length of the copy above them;
  where subgrid is missing they simply start at the top of each cell. Below
  `lg` the cells stack with a hairline between them; from `md` each sets its
  text beside its snippet. A cell's vertical padding is the section rhythm
  (`BENTO_CELL_PY`: 48px on a phone, 56 on a tablet, 96 from `lg`, 128 from
  `xl`; the first and last cell are the section's padding).
- **No head of its own.** Only the how-it-works index's labels are new strings,
  so the section has no heading: each cell's title is an `h2`, and the section
  landmark is named by the three of them (`aria-labelledby` with three ids).
  Each snippet is a `figure` named by its cell's title.
- **The snippets** (`BentoSnippets.tsx`) are lightweight replicas of the
  product's own rows on a `bg.canvas` panel (hairline, 16px corners), fed from
  `landing.phone`, so they add no copy. They keep to neutral tokens; green is
  used only as state: the selected "When" chip (success tint, green 800 label),
  the focus colour of the title field while it types, and the accepted row
  (success tint, green 400 check with an ink glyph). Prices are ink at 600 with
  tabular figures. There is no button to press in them that is green.
  - *Post a task:* what, where, when and budget as the product's fields (8px
    corners, `border.strong`). The title types itself; "When" is a real radio
    group (native radios, so the arrow keys work).
  - *Compare quotes:* three quote rows (avatar, name, rating, price, message).
    The name is a `button` with `aria-expanded` (named by `phone.quotes.expand`)
    and a pseudo-element stretches it over the card; opening one closes the
    others, the first starts open.
  - *Hire and pay directly:* the chosen quote with its booking, then the
    accepted row. The check scales in on `sdlMotion.easing.emphasis`, the
    easing the SDL keeps for confirmations.
- **Motion.** `useSnippetEntrance` has three phases: `static` (server HTML, no
  JS, reduced motion, or a snippet already on screen or behind the visitor at
  hydration: the finished state, no inline styles), `waiting` (hydrated, below
  the fold: rows held back with opacity and an 8px rise, so nothing shifts) and
  `playing` (in view: the rows fade in with the `Reveal` rise, 70ms apart, once;
  the title types; the check lands). The cell text uses `Reveal`.

## Behaviour by device

- **Desktop (`lg`+):** one phone in an absolutely positioned track that spans
  from under the hero text to the end of the worker act. Vertically it is
  pure CSS sticky (starts under the hero, pins at mid-screen, lets go when
  the story ends); sideways it slides into the right column as the hero
  scrolls away. Server HTML starts centred, so there is no first-paint jump.
- **Below `lg`:** no pinned phone. Each step is its text followed by its own
  phone, which plays once a third of it is on screen and resets only after
  it has left. The scene shows three objects (`COMPACT_OBJECTS`).
- **Reduced motion / no WebGL / no JS:** no canvas. The hero shows the still
  poster, phone screens show their finished state, and the desktop phone
  snaps to the right column instead of sliding. Every transition inside the
  phone is zeroed by `PhoneFrame`.

## Updating the poster

The poster is rendered from the `PosterWide` / `PosterCompact` stories of
`LandingScene` (transparent background). Re-render it after changing the
hero formation or the models: screenshot those stories headlessly (e.g.
Playwright with `omitBackground: true` at 1440x900 and 390x844, 1.5x) and save
WebP files to `public/images/landing/hero-objects-{wide,compact}.webp`.

## Brand tokens

UI references SDL semantic tokens only (`src/theme/chakraSystem.ts`). WebGL
can't read tokens, so `scene/scenePalette.ts` mirrors the SDL greens plus the
material colours (cardboard, wood, metal, fabric): the only raw hex here.
**Green-ink rule:** green fills use dark ink text, never white.

## Deliberate calls

- Phone screens are lightweight replicas styled with SDL tokens, not the app
  components (those pull in Apollo, auth and routing). Keep them close to the
  real UI when the app changes: bottom bar, price pins, task detail, thread.
- The 3D tone mapping is Khronos PBR Neutral (ACES greyed the greens).
- No HDR environment file is fetched: reflections come from drei lightformers.
- Demo people, tasks and prices are fictional and live in the i11n bag
  (`landing.phone`), in English and Traditional Chinese.
