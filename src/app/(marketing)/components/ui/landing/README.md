# Slashie marketing landing

`/home`: a scroll story that introduces Slashie. A fixed white page with
floating real-time 3D objects (toolbox, mop bucket, boxes, paint roller,
screwdriver, map pin) sits behind a server-rendered narrative, and an HTML
phone demos the real app as you scroll (pinned beside the steps on desktop,
inline in each step below `lg`). Lives inside the production app
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
| `hero` | hero heading + search CTA, then (until the first step) the map panel and the bento | Search (customer) | `hero`: left and right edges |
| `post` · `quotes` · `chat` · `hire` · `review` | customer act | Post · Quotes · Chat · Hire · Review | `customer`: right half |
| `workerFind` · `workerQuote` · `workerProfile` | worker act | Search (worker) · Quote form · Profile | `worker`: tools forward |
| `trust` · `pricing` | the trust row, live pricing | (phone has left) | `scatter`: right side |
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
    LandingStory.tsx         the hero, then how it works: the acts as hairline rows, the pinned phone
    StoryIndex.tsx           the section index (vertical from lg, a sticky row below), driven by the tracker
    storySteps.ts            pure: the steps of each act, the rows' ids, the index's groups (unit-tested)
    storyLayout.ts           header, index row and scroll-margin measures
  phone/
    PhoneFrame.tsx           device chrome; 375x812 screens scaled to the frame width
    PhoneDemo.tsx            stage -> screen; StickyPhone (desktop) / StepPhone (inline)
    screens/*                one scripted beat per screen (useDemoBeat: tap or autoplay)
    PhoneMap.tsx             the drawn monochrome map + the app's price pins (white pills)
    phoneParts.tsx           tab bar, hotspot, avatar, card, primary button
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
  sections/                  TrustSection (the trust row) · PricingTeaser (two plan cards and a pill) · FinalCtaBand (the closing call: heading, body, two pills)
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
two `SectionRule`s, so the order is hero, panel, then how it works, the acts and
the phone (on both layouts). It belongs to no story stage: the scene stays in the hero
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
map panel, bento, then how it works (on both layouts). It belongs to
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

## How it works

The customer act, then the worker act (`story/LandingStory.tsx`), in the page
column under the bento's rule. `id="how-it-works"` is on the section (the
hero's "See how it works" lands it under the sticky header).

- **Layout from `lg`.** Two halves, as the 3D scene's formations expect (text
  on the left, the objects and the phone on the right; from `xl` they are equal
  halves, from `lg` the right one is 22rem). The left half is the index (9rem,
  10rem from `xl`) beside the steps; the right half is the phone, pinned. Below
  `lg` it is one column.
- **An act** is a `SectionHead` (a small green 600 icon and the eyebrow, "For
  customers" or "For workers", then the h2 at 34/41, 44/48 from `lg`) over its
  steps. Its head belongs to the act's first step, so the phone and the index
  move to the act as soon as its head is mid-screen.
- **Steps are hairline rows** (an `ol`; each row is an `li` with a 1px
  `border.default` on top, the last also below). The number is Geist Mono 12 in
  `text.subtle` (never green), the title is an h3 at 18/500 (`heading-sm`) and
  the body is 14 in `text.muted`. The first step keeps the tap hint (a green 600
  pointer icon, the text muted). From `lg` a row is at least `max(300px, 42vh)`
  tall, with its text at the top: the phone changes as the row's top crosses
  the middle of the screen, so the new text arrives just under that line, and
  the row is tall enough that a fast scroll cannot skip it (the tracker watches
  one line). Below `lg` a row is its text and its own phone.
- **The section index** (`StoryIndex`) lists one short label per step, the two
  acts apart: a list in the left column from `lg` (a 1px `border.default`
  hairline with the active label's 2px green 600 bar over it), a row below it
  that sticks right under the header, full width, scrolls sideways when the
  labels do not fit and keeps the active label in view (the bar is then an
  underline). The active label is `text.default` and the rest `text.subtle`, all
  at 500. It reads the stage from the story tracker (`useStoryStage`), so it
  always agrees with the phone, and each label links to its row
  (`#how-it-works-<stage>`; `scroll-margin-top` lands the row across the middle
  of the screen from `lg`, and under the index row below it, so the linked step
  is the active one). It is a `nav` named by `landing.story.index.label`, the
  active link carries `aria-current="location"`, and it must be a direct child
  of the box that spans both acts, so that `position: sticky` runs along them.
- **Copy:** the only new strings are the index's: `landing.story.index` (a name
  for the nav and the eight short labels), in English and Traditional Chinese.
  The group names are not new strings: the index has none (a gap, or a hairline
  in the row, separates the acts).
- **The phone** is plain CSS: a `position: sticky` box in the right half, so the
  server HTML already has it in place and reduced motion changes nothing. The
  old sideways slide (the phone travelled from the hero's centre into the right
  column) and the empty spacer it started in are gone: the hero no longer holds
  a phone. The phone starts on the search screen (`hero` stage) until the first
  step is under the middle line.
- **The phone's screens** follow the product after Train 1: neutral tiles and
  avatars (no mint), the drawn map in neutral tokens, price pins as pills
  (hairline, green 800 price; the selected one green 400 with an ink price),
  pill buttons and chips, 8px fields on `border.strong`, 12px cards, prices in
  ink at 600 with tabular figures, a bottom bar whose active tab is ink (the
  green Post button is its only green), a tab underline in green 600 and the
  tap ring in green 600. Green stays for state: the selected "When" chip and the
  success cards (task posted, quote accepted, quote sent).

## Trust

The trust row (`sections/TrustSection.tsx`) is the four reassurance points
(`landing.trust.points`, today's strings) as a hairline row between the two
section rules that `home/page.tsx` puts round it. It is the stage `trust` and
it has no card: no tint, radius or shadow.

- **Layout.** From `lg` the four points sit side by side across the page column
  (`sizes.page`), divided by 1px `border.default` lines that run from rule to
  rule; the first has none, because the frame's rail is on that edge. From `md`
  they flow into two columns with a hairline before the right-hand column and
  above the second row; below `md` they stack with a hairline between them. The
  points are a plain list (`ul`), so a screen reader announces a list of four.
- **A point** is a green 600 check (`accent.active`, 20px, hidden from assistive
  technology) beside the text at 16/500 in `text.default`; the check sits level
  with the first line, so a point that wraps keeps it at the top. Green is the
  state icon here, never a fill (the old green 400 disc is gone).
- **Rhythm.** A point's vertical padding (`TRUST_CELL_PY`: 20px on a phone, 32 on
  a tablet, 48 from `lg`, 64 from `xl`) is a step tighter than `SECTION_PY`: this
  is one line of reassurance between two long sections, not a story, so the row
  stays a band rather than a block of white.
- **Opaque.** The section is `bg.surface`, like the map panel and the bento: the
  3D scene stays behind it, so a prop never crosses a point.
- **No head.** The only new strings the train allows are the how-it-works index's
  labels, so the row has no eyebrow or heading, and so it is not a named
  landmark (a `section` with no name is plain content). A heading needs a string
  first; ask Ryan before adding one.
- **Motion.** Each point is a `Reveal` (a fade with an 8px rise, 400ms, once),
  staggered 70ms; reduced motion and no JS show them as they are.

## Pricing teaser

The pricing teaser (`sections/PricingTeaser.tsx`) is the worker side of the price
in two plain cards and one pill to `/pricing`, between the two section rules that
`home/page.tsx` puts round it. It is the stage `pricing`. The live pricing (the
trial label, the price line, the free quotes) is still built in `home/page.tsx`
and arrives as `pricing` (`LandingPricing`); the section only sets it, so a
missing price degrades to the generic lines as before. No string is added: the
heading, the body, the two plan labels, the free body and the pill label are
today's.

- **Head.** `SectionHead` without an eyebrow (an eyebrow needs a string first):
  the h2 at 34/41, 44/48 from `lg`, 500, and the body in `text-lg` muted. The
  section is a landmark named by that heading (`aria-labelledby`).
- **Layout.** From `lg` the head and the pill sit in the left column (5fr) and
  the two cards in the right one (7fr), the cards spanning both rows, so the
  pill sits right under the head. Below `lg` the order is the head, the cards
  (two columns from `md`, one on a phone) and the pill, which is also the DOM
  order, so the reading order never changes.
- **A plan card** is the product's card recipe (`sdlCardSurface`: `bg.surface`,
  a 1px `border.default` hairline, 12px corners, `e1`), left-aligned, with
  `p` 20 / 24 / 28 by breakpoint. In it: a label (14 at 500; `text.muted` for the
  free plan), the headline as an h3 (`heading-lg`, 24/30 at 500, tabular
  figures, balanced) and a `text-sm` muted line. Both cards stretch to one
  height. The headline is one string (a trial, a price or "3 quotes a month"),
  so it stays a heading at 500; the 600 figure weight is for a price that is its
  own element.
- **Plum** (`accent.premium`) is the worker subscription's colour and it is
  kept for the paid plan only: its label with the sparkle, its 1px hairline
  (instead of `border.default`; it was a 2px line) and the pill (the `premium`
  Button variant, white label). Nothing else is plum and nothing here is green:
  the page's one green action is the hero's, and the closing call has its own.
  If the pill should be quieter, `variant="secondary"` is the one prop to change.
- **Opaque** (`bg.surface`), like the map panel, the bento and the trust row: the
  3D scene stays behind it, so a prop never crosses a card.
- **Motion.** The head, each card (staggered 120ms) and the pill are `Reveal`s (a
  fade with an 8px rise, 400ms, once); reduced motion and no JS show them as they
  are.
- **The pricing page** is to follow this recipe when it is restyled (the spec:
  "the pricing cards follow the teaser"): the same hairline-and-`e1` card, plum
  only for the paid plan.

## Final call to action

The closing call (`sections/FinalCtaBand.tsx`) is one centred line, one sentence
and two ways in, under the section rule that `home/page.tsx` puts above it
(the footer is its own band below). It is the stage `cta`. No string is added:
the heading, the body and the two labels (`ctas.postTask`, `ctas.becomeWorker`)
are today's, and the hrefs arrive localized from the page.

- **Head.** The h2 is `display-lg` (44/48 at 500, -0.035em) from `md` and
  `heading-xl` (34/41) on a phone, the same step down as `SectionHead`, with
  `text-wrap: balance`; the body is `text-lg` in `text.muted`, also balanced.
  Both are centred inside a 40rem measure. There is no eyebrow and no icon (an
  eyebrow needs a string first): this and the hero are the only centred sections.
  The section is a landmark named by its heading (`aria-labelledby`).
- **The two pills.** Post a task is the primary Button: green 400 with an ink
  label, 52px (`size="lg"`, the height of the hero's search pill). Become a
  worker is the outline pill (`variant="secondary"`: white, a 1px `border.strong`
  hairline, an ink label, the hairline steps to `border.hover`). The primary
  keeps the `Magnetic` pull (fine pointers only, off under reduced motion). The
  pills sit in one centred row and wrap onto their own rows when the width
  cannot hold both (below about 330px of content, so 320px phones). Post a task
  is the section's only green; nothing else here is green or heavier than 600.
- **Transparent.** Unlike the panels above it (map panel, bento, trust, pricing)
  the section has no background: the scene's `gather` formation is this
  section's beat, so the objects have to show round the call. The text block
  never grows past 40rem, so the objects must stay outside that column. Today's
  `gather` formation does (checked at 390, 834, 1366 and 1920 wide). The frame's
  rails are drawn over the scene (`zIndex` 1), so an object that sits on a rail
  is crossed by it.
- **Rhythm.** `SECTION_PY` on the section (56px on a phone up to 128px on a wide
  screen), 32px between the text and the pills on a phone and 40px from `md`.
- **Motion.** The text and the pills are `Reveal`s (a fade with an 8px rise,
  400ms, once; the pills 120ms later); reduced motion and no JS show them as
  they are.

## Behaviour by device

- **Desktop (`lg`+):** the index, the steps and one phone (see How it works).
  The phone is sticky in the right half: it starts at the top of the steps,
  pins at mid-screen and lets go when the last step ends.
- **Below `lg`:** no pinned phone. The index is a row under the header; each
  step is its text followed by its own phone, which plays once a third of it is
  on screen and resets only after it has left. The scene shows three objects
  (`COMPACT_OBJECTS`).
- **Reduced motion / no WebGL / no JS:** no canvas. The hero shows the still
  poster and phone screens show their finished state. Every transition inside
  the phone is zeroed by `PhoneFrame`; the index does not animate.

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
