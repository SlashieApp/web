# Slashie marketing landing

`/home`: a scroll story that introduces Slashie. A fixed white page with
floating real-time 3D props (a toolbox, boxes and a map pin) sits behind a
server-rendered narrative, and an HTML
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
| `hero` | hero heading + search CTA, then (until the first step) the map panel and the bento | Search (customer) | `hero`: toolbox and boxes flank the text, the pin top right |
| `post` · `quotes` · `chat` · `hire` · `review` | customer act | Post · Quotes · Chat · Hire · Review | `customer`: down the right edge |
| `workerFind` · `workerQuote` · `workerProfile` | worker act | Search (worker) · Quote form · Profile | `worker`: the same edge, the props change places |
| `trust` · `pricing` | the trust row, live pricing | (phone has left) | `scatter`: waits at the right edge, under the opaque panels |
| `cta` | Post a task / Become a worker | | `gather`: either side of the call |

Each step also brings one "focus" prop forward, in place (`formations.ts`). See
3D props.

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
    LandingScene.tsx         Canvas, damped formation moves, blob shadows
    SceneLights.tsx          the neutral light rig (the object stories use it too)
    formations.ts            poses per formation (viewport fractions), the wide x limit, unit-tested
    materials.tsx            Matte (flat shaded) and BevelBox, the low-poly building block
    scenePalette.ts          the one place for raw hex (white, zinc, ink, one green; unit-tested)
    objects/*                the three low-poly models: Toolbox, Boxes, MapPin
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
                             FloatingPostPill (the ink "Post a task" pill fixed bottom-centre) · floatingPillWatch.ts (when it shows: pure, unit-tested)
```

## Frame and rhythm

The page is white (`bg.surface`; the backdrop paints it behind the 3D scene).
The shared frame lives in `../layout/MarketingFrame.tsx` and every marketing
section builds on it:

- `MarketingFrame` wraps the sections (not the footer): from `lg` it draws a
  1px `border.default` rail down each side of the page column (`sizes.page`,
  the same measure as `<Container>` and the header) for the full height. The
  rails start one header height above the frame, under the sticky header (like
  the hero glow), so at the top of the landing, over the transparent header,
  they run in from the screen's edge instead of starting in mid-air; the solid
  header covers that stretch and they meet its border.
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
- **One green fill per screen, the header included.** The marketing header's
  Get started (Open in app on a phone) is the green primary only while no
  green action of the page's own is in view. It is secondary over the hero (the
  Search pill is the screen's green) and again at the closing call to action
  (the green Post a task, on the landing and at the foot of `/about`);
  `layout/pageGreenWatch.ts` watches `[data-landing-hero]` and
  `[data-final-cta]` and the header reads it (`quiet`). On a page with neither
  (`/pricing`, the legal pages) it is the screen's one green button. A new
  section with a green action of its own either carries one of those hooks or
  extends `PAGE_GREEN_BLOCKS`. This is a decision, not an accident: if Ryan
  wants the header's green to stay beside the close, record that exception on
  FE-471 and drop the `pageGreen` term in `MarketingHeader`.

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
- **Rhythm.** The h1 sits `SECTION_PY` under the header (56px on a phone up to
  128px); the foot (`HERO_PB`) is a step tighter, 56 / 64 / 80 / 96px, so the
  hero's text reads as one group above its rule (the sketch has 88 above and 72
  below) instead of the old 32 to 40px. The extra foot is also what keeps the
  props that sit under the link row on a phone, and their shadows, off the rule.
- A faint radial grey (`bg.subtle` fading to nothing, `data-hero-glow`) sits
  behind the top of the page. It starts under the sticky header so there is no
  seam, and it is painted under the still poster.
- The entrance is the `fade-rise` keyframe (a fade with an 8px rise, 400ms on
  the decelerate curve, once, staggered 60ms); reduced motion turns it off. The
  phone screens use it too (the old 28px `rise-in` keyframe is gone: the phone
  was its only user, and the spec's reveal is 8px).

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
- **The map box** runs edge to edge across the page column (80rem), between the
  frame's rails and the section rules, with no inset, radius or band of padding
  round it (as in the approved sketch: the panel is flush; the first build had
  an inset rounded card in a grey band, about 130px of empty grey above and
  below). It keeps an aspect ratio per breakpoint (9:10 on a phone, 3:2 from
  `sm`, 9:5 from `md`, 11:5 from `lg`; `MAP_ASPECT`), so it works from 390 to
  1920 wide. On a phone a hairline closes the map and the card sits under it on
  the page's 16px gutters.
- **Pins** are real buttons named by `landing.phone.search.selectPin` ("Show the
  £45 task"). They are a single choice, not toggles (pressing the chosen pin does
  nothing), so the chosen one carries `aria-current="true"`, not `aria-pressed`.
  They are in the DOM, and so tabbed, top to bottom in both layouts
  (`SHOWCASE_ORDER`, asserted by the model test): the narrow and the wide layout
  put the pins in different places, so no single left-to-right order would hold
  for both, and top to bottom is the reading order of a map. A pin is a white
  pill with a 1px `border.default` hairline, `e1`, and the price in green 800 at
  600 with tabular figures; the selected one is green 400 with an ink price and
  `e3`. The area sits under the dot as a map label at 12px in `text.muted` (6:1
  on the map's park fill; 11px `text.subtle` was 4.1:1 there, under AA, and under
  the type scale's 12px floor). Focus is a green 600 ring round the pill. Hover
  steps the hairline to `border.hover`. In Windows high contrast (forced colours)
  the fills and the 6% scale are not drawn, so the chosen pin's pill takes a 3px
  `Highlight` border.
- **Keyboard.** Choosing a pin with Enter or Space brings the card on screen
  (`scrollIntoView`, `nearest`, clear of the sticky header, instant under reduced
  motion): from `md` the card floats at the map's foot and on a laptop-height
  screen it can be below the fold. A click or tap does not scroll.
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
  `{count} quotes`. The string has no plural form (a new string is not allowed
  here), so the Fulham demo task has 2 quotes in the bag, not 1, so that no card
  or search row reads "1 quotes". If a plural-aware string is ever allowed, the
  count can go back to 1.
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
  (`BENTO_CELL_PY`: 56px on a phone and a tablet, 96 from `lg`, 128 from
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
    others, the first starts open. The rating is the `Rating` component with
    its accessible name set to the score alone ("4.9", as the phone demo reads
    "4.9 (32)"): its default name is the English "Rating: 4.9", which the zh-HK
    page would read out, and there is no string for a label.
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
  underline). Below `lg` the first act's head has 32px of room under the row.
  The active label is `text.default` and the rest `text.subtle`, all
  at 500. In Windows high contrast (forced colours) the bar's background would be
  painted Canvas and the active label would look like the rest, so the bar takes
  the system `Highlight`. It reads the stage from the story tracker (`useStoryStage`), so it
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
- **Motion in the phone.** Every entrance in the phone is the 8px `fade-rise`
  (the screens' own CSS animations) or `enterStyle` (a transition of opacity and
  an 8px rise, staggered 70ms; the explicit longer distances are the app's own
  sheets and nav). `PhoneFrame` zeroes every transition and animation inside it
  under `prefers-reduced-motion` (`animation-duration: 0ms !important`, one
  iteration), so no screen needs its own guard: nothing in the phone moves under
  reduced motion. The post screen is the one whose finished state covers its
  content (the "Task posted" toast sits over the first field), so under reduced
  motion it rests in its starting state, with the form showing and the hotspot a
  still green 600 ring (not a pulse), rather than on the finished state; a tap
  plays the result (`useDemoBeat(active, intro, false)`). Every other screen
  still jumps to its finished state.
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
- **Rhythm.** Cells touch the rules (the dividers run from rule to rule), so a
  cell's padding is the section's. The section's edges take the frame's
  `SECTION_PY` like every other section (56px on a phone, 80 on a tablet, 96 on
  a laptop, 128 on a wide screen), and the padding between points that sit above
  one another is tighter (20px stacked, 32px in the 2 x 2 grid) so four short
  lines do not become a block of white (`trustCellPadding`, unit-tested). From
  `lg`, where the four sit in one row, every cell is `SECTION_PY`. The first
  build had them a step tighter all round (a row 177px tall at 1366), below the
  spec's "generous section padding (96 to 128px desktop, 56 to 64px phones)".
- **Opaque.** The section is `bg.surface`, like the map panel and the bento: the
  3D scene stays behind it, so a prop never crosses a point.
- **No head.** The only new strings the train allows are the how-it-works index's
  labels, so the row has no eyebrow or heading, and so it is not a named
  landmark. Its wrapper is a `div`, not a `section`: a landmark needs a name and
  a name needs a string (none of today's fits), and an unnamed `section` claims a
  structure it cannot have. The spec's "each section is a landmark with a
  heading" does not hold for this one section until Ryan allows a heading string
  (a visually hidden one would do); this is a recorded deviation, not an
  accident.
- **Motion.** Each point is a `Reveal` (a fade with an 8px rise, 400ms, once),
  staggered 70ms; reduced motion and no JS show them as they are.

## Pricing teaser

The pricing teaser (`sections/PricingTeaser.tsx`) is the worker side of the price
in two plain cards and one pill to `/pricing`, between the two section rules that
`home/page.tsx` puts round it. It is the stage `pricing`. The live pricing (the
trial label, the price line, the free quotes) is still built in `home/page.tsx`
and arrives as `pricing` (`LandingPricing`); the section only sets it, so a
missing price degrades to the generic lines as before. No string is added: the
heading, the body, the two plan labels, the free body, the pill label and the
eyebrow are today's.

- **Head.** `SectionHead` with an eyebrow: the nav's "Pricing"
  (`header.nav.pricing`, "收費" in zh-HK, passed from `home/page.tsx`: an existing
  string, so no copy is added) and a small green 600 tag icon, then the h2 at
  34/41, 44/48 from `lg`, 500, and the body in `text-lg` muted. The section is a
  landmark named by that heading (`aria-labelledby`). The eyebrow icon is the
  section's only green (an eyebrow icon is green 600 by the spec; never a fill).
  Of the other heads with no eyebrow, this is the one an existing string fits;
  the rest are an open decision (see Deliberate calls).
- **Layout.** From `lg` the head and the pill sit in the left column (5fr) and
  the two cards in the right one (7fr), the cards spanning both rows, so the
  pill sits right under the head. Below `lg` the order is the head, the cards
  (two columns from `md`, one on a phone) and the pill, which is also the DOM
  order, so the reading order never changes.
- **A plan card** is the product's card recipe (`sdlCardSurface`: `bg.surface`,
  a 1px `border.default` hairline, 12px corners, `e1`), left-aligned, with
  `p` 20 / 24 / 28 by breakpoint. In it: a label (14 at 500; `text.muted` for the
  free plan), the headline as an h3 (`heading-lg`, 24/30, balanced) and a
  `text-sm` muted line. Both cards stretch to one height. The headline is a
  figure (a trial, a price or "3 quotes a month"), so it is 600 with tabular
  figures (`sdlFigure`), as the price is on the pricing page's cards, which
  follow this card (the type rule: "prices, counts and other figures are 600
  with tabular figures"). The first build set it at 500 and the pricing page at
  600.
- **Plum** (`accent.premium`) is the worker subscription's colour and it is
  kept for the paid plan only: its label with the sparkle, its 1px hairline
  (instead of `border.default`; it was a 2px line) and the pill (the `premium`
  Button variant, white label). Nothing else is plum and nothing here is a green
  fill or text: the page's one green action is the hero's, and the closing call
  has its own.
  If the pill should be quieter, `variant="secondary"` is the one prop to change.
- **Opaque** (`bg.surface`), like the map panel, the bento and the trust row: the
  3D scene stays behind it, so a prop never crosses a card.
- **Motion.** The head, each card (staggered 120ms) and the pill are `Reveal`s (a
  fade with an 8px rise, 400ms, once); reduced motion and no JS show them as they
  are.
- **The pricing page** follows this recipe (the spec: "the pricing cards follow
  the teaser"): the same hairline-and-`e1` card, plum only for the paid plan. See
  Pricing page.

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

## Floating Post a task pill

The floating pill (`sections/FloatingPostPill.tsx`) is an ink pill fixed to the
bottom centre of the screen: the page's post label and an arrow, linking to the
page's post action. `home/page.tsx` renders it last, after the footer, with
`ctas.postTask` and `hrefs.postTask`. No string is added. The hero has no post
button of its own (its action is the search), so the pill goes where the closing
call's Post a task goes: register, then on to `/tasks/create`.

- **When it shows** (`sections/floatingPillWatch.ts`, pure rules plus one
  IntersectionObserver): once the hero is out of view (scrolled past, above the
  screen: `heroIsAbove`), and not while the final call to action or the footer is
  in view. The page's hooks are `data-landing-hero` (on `HeroSection`),
  `data-final-cta` (on `FinalCtaBand`) and the `footer` element; the watched
  selectors are props with those as defaults. A hero below the screen does not
  count, so it never shows before the visitor has seen the hero. A reload part
  way down the page is right at once, because the observer reports every target
  when it starts. The pill is hidden from the server render and after hydration
  the visitor's scroll shows it, so there is no flash.
- **Where it sits.** `position: fixed`, centred, `16px` above the bottom edge or
  above whatever is there: `calc(max(env(safe-area-inset-bottom, 0px),
  var(--cookie-banner-height, 0px)) + 16px)`. The cookie banner publishes its own
  height as `--cookie-banner-height` on `<html>` while it is open and removes it
  when it closes (`src/app/cookieBannerLayout.ts`, set by `CookieConsentBanner`
  with a ref callback and a ResizeObserver), so the pill sits above the banner
  and never covers it; it also stacks below it (`zIndex` 2 in the page, the banner
  is `banner`, 1200). The row spans the screen with `pointer-events: none`, so
  only the pill takes a tap.
- **The pill.** A `Button` (`asChild`, so one `a`): 44px, fully round, a 500 label
  and an 18px arrow (decorative, `aria-hidden`), `e3` for floating chrome. Ink is
  `text.default` with a `bg.surface` label, the pair the app already uses for an
  ink fill, so it also reads in dark mode. Hover steps the fill to `text.muted`;
  focus is the usual green 600 ring. Nothing here is green but that ring, so the
  hero's Search and the close's Post a task stay the page's greens (one green
  action per screen). No counters, no social proof.
- **Accessibility.** One link named by its label ("Post a task"). While hidden
  it is `visibility: hidden` (after the fade-out), so it is out of the tab order
  and the accessibility tree and a keyboard never lands on something invisible;
  shown, it is a normal tab stop. It stays shown while it holds focus, so
  scrolling on never pulls it from under the keyboard. It is the last element of
  the page in the DOM, outside the sections' landmarks, so a keyboard reaches it
  after the page's own controls; the closing call offers the same action in the
  reading flow.
- **Motion.** In: a fade with a 16px rise, 400ms on the decelerate curve. Out: a
  200ms fade. Reduced motion (read with `matchMedia`, so a story can set it): it
  fades without any rise (no `transform` at all). It is not printed.

## Pricing page

`/pricing` (`src/app/(marketing)/pricing/`) takes the same frame as the landing
(the spec: "the same frame, rules, eyebrows and type; the pricing cards follow
the teaser"). `components/PricingPageView.tsx` assembles it (frame, page header,
the plans section, the questions); `page.tsx` loads the data and adds the footer
and the view's analytics. The views (who sees which button) are unchanged:
`pricing/views/README.md`.

- **Frame.** A white page (`MarketingFrame bg="bg.surface"`), the rails from `lg`,
  and a `SectionRule` under the title and one between the plans and the
  questions. The marketing header turns white on `/pricing` (`FRAMED_ROUTES` in
  `MarketingHeader.tsx`: a route goes in that list when its page takes the frame).
  The page header's bar is opaque and sits 10 deep, so the page passes
  `railsZIndex={11}` and the rails run unbroken from the site header.
- **Page header (FE-458) stays.** The big "Membership" is the page's one h1 and
  collapses into the bar as before. The header now sits outside a `<Container>`
  (so the rules can run edge to edge) and says its column and colour:
  `MarketingPageHeader` takes `contentMaxW`, `contentPx` (the Container's measure
  and gutters) and `background`.
- **Sections** are `PricingSection`: a landmark named by its h2 (`aria-labelledby`),
  `SECTION_PY`, the page column. Below `xl` the head sits over the content; from
  `xl` the head is the left column (4fr) and the content the right one (8fr),
  as the teaser sets its head and cards (`PRICING_SPLIT`; the cards need about
  300px each, which the right column only has from `xl`). The plans section is
  `SectionHead` (the h2, the body), the two cards and the purchases note; the
  questions are `SectionHead` ("Questions") and the rows. Neither head has an eyebrow:
  an eyebrow needs a string and this page adds none; `SectionHead` takes
  `eyebrow` and `icon` when there is one.
- **Plan cards** are the teaser's card: `sdlCardSurface` (white, a 1px hairline,
  12px corners, `e1`), `p` 20 / 24 / 28, left-aligned, one height. In order, as
  before: the plan's name (an h3, a 14/500 label, muted on Free), its line, the
  price as a figure (`heading-xl` at 600 with tabular figures: "£0 / month",
  "6 months free"), the "Then" line, a hairline, the features with green 600
  checks and the pill. The icon tiles are gone (the teaser has none). "Your plan"
  is still the `success` tag, because it is a state.
- **Plum** is the paid plan's: its name with the sparkle, its 1px hairline (it was
  a 2px green one) and its pill, the `premium` Button (the links and
  `PricingCheckoutButton`, which is why the `premium` variant keeps its plum while
  loading). Free's pill is outline. Green is not a button colour on this page:
  the marketing header's Get started is already the screen's one green button,
  and a second would break "one per screen". To make the paid pill green, change
  `variant` in `PlanAction` and `PricingCheckoutButton` to `primary`.
- **Questions** are hairline rows, not cards: an h3 at 18/500 (`heading-sm`) over
  the answer at 14 in `text.muted`, a hairline above each and under the last, and
  the Terms line under them.
- **Headings.** One h1 (the title), h2 for the plans head and "Questions", h3
  for the plan names, the questions and the "Pricing isn't loading" card (the plan
  names were h2 before the plans section had a head of its own).
- **Loading and unavailable.** `loading.tsx` draws the same frame, rules and grid
  with skeletons. With no plans from the API the plans section shows the card
  (left-aligned now) and the questions are left out, as before.
- **Motion.** The head and the content of each section are `Reveal`s; reduced
  motion and no JS show them as they are.

## About page

`/about` (`src/app/(marketing)/about/`) takes the same frame, rules and type as the
landing. `components/AboutScreen.tsx` renders the page inside `MarketingFrame`
(`bg="bg.surface"`) from the copy and the view; `page.tsx` adds the footer under the
frame. The views (who sees which closing button) are unchanged: `about/views/README.md`.

- **Frame.** A white page, the rails from `lg`, and a `SectionRule` between each of the
  five sections (the title, how it works, what it costs, the mission with the open
  source note, the closing band). The marketing header is white on `/about`
  (`FRAMED_ROUTES`). Each section is a landmark named by its heading (`aria-labelledby`),
  in the page column with `SECTION_PY`.
- **Title.** The h1 "About Slashie" is left-aligned (only the landing hero and the
  closing band are centred): `display-xl` (56/58) from `md`, `display-lg` (44/48) on a
  phone, the body in `text-lg` muted with `text-wrap: balance`.
- **Heads.** Every section head is `SectionHead` (left-aligned, an h2 at 34/41, 44/48 from
  `lg`, 500). They have no eyebrow: an eyebrow needs a string and this page adds none.
  The eyebrow style (12/16 caps, 500, +0.08em, `text.subtle`, with a small green 600
  icon) is on the two step groups' names instead, which are today's strings ("If you
  need a hand", "If you do the work"; the same user and hard hat icons as the landing's
  acts). They stay h3s.
- **Steps** follow the landing's: hairline rows in an `ol` (a 1px `border.default` above
  each, the last also below). The number is Geist Mono 12 in `text.subtle`, as "01", "02",
  "03", never green and no disc behind it (it was a filled circle); the step is `text-md`
  in ink. The two groups sit side by side from `md` (a 32px gap, 64px from `lg`) and stack
  on a phone.
- **What it costs** is three hairline-topped columns from `md` (each an h3 at 18/500 over a
  14px muted line; stacked on a phone, with the last row closing the list). "See pricing"
  is the `emphasis` link (green 800), set close under the points.
- **Mission and open source** are two sections side by side from `md`, each a
  `SectionHead` with its text as the head's body (`text-lg` muted, 60ch). The GitHub and
  LinkedIn buttons are outline pills.
- **Closing band** is `FinalCtaBand` unchanged (the landing's close), under a rule. On
  this page there is no 3D scene behind it. Green is the group icons and its Post a task
  pill; the marketing header's Get started is secondary here while the close is on screen
  (one green fill per screen, as at the foot of the landing) and green higher up the page.
- **Motion.** The heads and the content of each section are `Reveal`s (the title is not:
  it is the first thing on the page); reduced motion and no JS show them as they are.

## Legal pages

`/terms`, `/privacy`, `/cookies` and `/help/safety` (`src/app/(marketing)/<route>/`) take the
same frame, rules and type as the landing (the spec: "the legal pages keep their reading
column (65 to 75 characters) inside the frame"). `components/layout/LegalPageLayout.tsx`
renders all four from their copy (`src/content/legal/*` and each route's `i11n.json`);
each `page.tsx` only loads the copy and adds the footer under the frame.

- **Frame.** A white page (`MarketingFrame bg="bg.surface"`), the rails from `lg`, and one
  `SectionRule` under the page header. The marketing header is white on these routes
  (`FRAMED_ROUTES`). The page header's bar is opaque and 10 deep, so the layout passes
  `railsZIndex={11}` and the rails run unbroken from the site header, as on `/pricing`.
- **Page header (FE-458) stays.** The title is the page's one h1 and collapses into the bar
  as before, with "Last updated" under it. The header sits outside a `<Container>` and says
  its column and colour (`contentMaxW`, `contentPx`, `background`), as on `/pricing`.
- **The policy** is one landmark (`section`, named by the title with `aria-label`: no new
  string) with `SECTION_PY` above and below (56px phone to 128px wide). Inside, the page's
  column (`<Container>`) holds the intro, then each section as a hairline row: a 1px
  `border.default` above it (the first row takes none when there is no intro, the page's
  rule does that), 32px (phone) or 40px (`lg`) above and below its content. The footer
  stays under the frame as its own band.
- **Rows.** From `lg` the heading is the left column (4fr) and the text the right one
  (8fr, a 48px gap), as the teaser sets its head and content; below `lg` they stack,
  heading first. The intro sits in the text's column with the heading's cell empty. Each
  section's `id` (the app links to `/help/safety#report`) is on the row, with a
  scroll margin that clears the marketing header and the bar (130px phone, 138px).
- **Type.** The section heading is an h2 at `heading-lg` (24/30, 500, -0.02em, ink), the
  text `text-md` (16/24) in `text.muted`, the intro `text-lg` (18/28) in ink. Email
  addresses are links (the content files stay markup-free). No eyebrow: an eyebrow needs a
  string and these pages add none.
- **Reading column.** `LEGAL_MEASURE` is `32em`, set on every paragraph, so the text
  holds about 70 characters of English per line (65 to 75; the stories measure the real
  copy of all four documents) and about 32 of Chinese. It is in `em`, not `ch`: the width
  of a "0" in Geist is 1.4 times the average letter, so `65ch` would run to about 95
  characters. A phone is narrower than the measure, so the text fills it inside the 16px
  gutters (about 46 characters a line); that is as it must be.
- **Motion.** None: a policy is read, not revealed, and a link to a section (`#report`)
  must land on text that is already there. The page header's collapse is its own.

## 3D props

The real-time scene (`scene/LandingScene.tsx`, three.js through react-three-fiber)
keeps its device tiers, its no-WebGL path and its stage API (`storyState`); what
it draws changed. Three props on laptops and up (a toolbox, boxes and a map pin)
and two below `lg` (the pin and the toolbox, `COMPACT_OBJECTS`), at about 70% of
the size the six-object scene had (the hero toolbox went from scale 1 to 0.7,
the boxes from 0.95 to 0.67, the pin from 0.8 to 0.56; `formations.test.ts`
holds every pose to that).

- **Low-poly, flat shaded.** Every model is plain bevelled boxes (`BevelBox`: a
  drei `RoundedBox` with one two-facet chamfer and no smoothing) and a few
  8-sided cylinders; the pin is a teardrop extruded from a 10-segment outline
  with an 8-sided hole. The one material is `Matte` (`flatShading`, rough, no
  clearcoat), so each face takes one tone from the light.
- **White and zinc, one green part each** (`scenePalette.ts`, the only raw hex;
  `scenePalette.test.ts` checks the colours and that nothing else holds a hex):
  `#FFFFFF`, `#E4E4E7`, `#D4D4D8`, `#A1A1AA`, `#71717A`, the scene's ink
  `#27272A` and the brand green 400 `#00DC82`. No cardboard, wood or metal
  tones. The green is a fill, never a line: the toolbox's carry grip, the strap
  over the top box, the disc in the pin's hole.
- **Light.** `SceneLights`: a white-to-zinc hemisphere light, one key light from
  the upper right and a faint fill. There is no environment map any more (the
  props are matte), and the old mint-tinted lightformer is gone. The blob
  shadows are ink at low opacity.
- **Formations** (`formations.ts`, poses as fractions of the visible viewport):
  `hero` puts the toolbox and the boxes either side of the search, level with
  it, and the pin top right; below `lg` the text fills the width, so the two
  props sit either side of the "See how it works" row, under the trust row and
  above the map panel. The hero's text and the panel under it are a fixed
  number of pixels from the top of the page, so `poseFor` takes the screen's
  height and keeps the hero formation its distance from the top (a tall screen
  would otherwise carry the props down behind the panel); every other
  formation is a plain fraction. `customer` and `worker` run the props down the
  right edge, the strip beside the pinned phone (they peek out from behind it
  on a laptop and sit in the margin beside it on a wide screen), and swap
  places between the acts; below `lg` they peek in at the edges beside the
  inline phone, and each keeps its side in every formation (the toolbox left,
  the pin right; the worker act swaps their heights, not their sides), so none
  glides across the text from one edge to the other. `scatter` (trust and
  pricing, under opaque panels) is parked off the screen's edges, so nothing is
  seen sliced by a section's edge while the close scrolls in, and the props glide
  in for it; `gather` (the close) puts the toolbox and the boxes either side of
  the call, outside its 40rem column, and the pin low on the right. Nothing
  sits between the steps and the phone: there is no room there at `lg`.
- **Placement** (`placementFor`, `placeX`: pure and unit-tested) holds a prop by
  the formation it is in. `free`: where the pose puts it (the hero on a phone,
  where the text leaves room beside its last row). `column`: on wide screens
  the whole prop, not its centre, stays inside the frame's rails (the page
  column is 80rem, rails 640px out, or the screen where that is narrower) with
  16px of air, using each prop's reach (`PROP_REACH`: half width, height above
  and shadow below, in world units, measured on the models), so no rail runs
  across a prop at 1366 or 1920. `peek`: below `lg` the text runs edge to edge,
  so a prop only peeks in from its edge: exactly as far as the free strip beside
  the text (`peekReachPx`: the gutter, less 4px of air, so 12px on a phone and
  20px on a tablet's left; the tablet's right strip beside the steps' 38rem
  column is wider; the close's centred 40rem column leaves the same on both
  sides), the pose saying only which side. `parked`: left where the pose is,
  off the edges.
- **The close stays above the footer.** The footer is opaque and covers the
  bottom of the screen at the end of the page (466px on a laptop), so the
  close's props, level with its call, were sliced by its top edge. `PageProbe`
  reads the footer's top edge once a frame while the close is the stage and
  `closeLiftPx` lifts the whole formation together (so the pin stays under the
  boxes), by the most any prop needs to keep its shadow 24px clear of the
  footer, and never so far that the highest goes up under the header.
- **The step object** (`FOCUS_FOR_STAGE`) comes forward and grows 20% where it
  is, on wide screens only. Nearer the camera a prop drifts outward, so its x
  and y are scaled back to keep its spot on the screen (a unit test holds this).
  The flat pin sways about its pose from step to step instead of turning, so it
  is never edge-on.
- **Draws only while a prop can be seen.** The canvas is `frameloop="demand"`.
  Only three blocks of the page are transparent (the hero, how it works and the
  close: `[data-landing-hero]`, `[data-how-it-works]`, `[data-final-cta]`); the
  map panel, the bento, the trust row, the pricing teaser and the footer are
  opaque and hide the scene. `story/sceneWatch.ts` (an IntersectionObserver
  below the header, started by `StoryTracker`) publishes `storyState.sceneVisible`
  and `FrameDriver` asks for the next frame each frame only while it is true.
  Measured on the dev server in headless Chromium (software GL), WebGL draw
  calls per second fell from about 600 to 1000 all down the page to none while
  the map panel, the bento, the trust row and the pricing teaser fill the screen
  (and about 200 to 400 in the acts, 400 to 900 over the hero).
- **Clear of text and of the rails.** Checked on the live page (`next dev`) by
  scrolling the whole of /home in steps of about half a screen and, at each stop
  once the props have settled, diffing a screenshot with the canvas on against
  one with it hidden: prop pixels under any page text (plus 4px) and prop pixels
  on a rail column. Swept at 390, 768, 1366 and
  1920 wide (14 to 26 stops each): at every settled stop no prop pixel is over
  page text and none is on a rail (the first build had the hammer touching the
  right-hand rail at 1366 and the rails across the toolbox and the boxes at
  1920), with one exception. At 390 there is one stop where the hero formation
  still holds while the first act's head scrolls through the middle of the
  screen: the stage changes when that head reaches the middle, so for about
  100px of scroll the hero's toolbox is behind the head's text before it glides
  to the edge (a transition, not a resting place).
  The scene is a fixed layer under scrolling text, and its props glide for about
  a second and a half when the stage changes (the stage is the section
  mid-screen), so a screenshot taken a moment after a scroll can catch a prop
  mid-glide; the sweep waits for the props to settle. On a phone, where the text
  fills the width, the props are only slivers at the edges, and they keep their
  sides, so they never cross the text on the way. The props are light (white to
  zinc 300), so a sliver behind a line still reads at AA for `text.default` and
  `text.muted`.
- **Deleted:** the mop bucket, the paint roller and the screwdriver (no
  formation uses them), the cardboard, wood, metal and fabric materials, and the
  lightformer environment. The device tiers (`useDeviceTier`: reduced motion or
  no WebGL gives no canvas and the still poster), `LandingBackdrop` and
  `HeroObjectsPoster` are as they were; only the poster images are new.
- **Stories:** `SceneObjects` (the three models alone), `LandingScene` (every
  formation, wide and compact, plus the `Poster*` sources),
  `LandingBackdrop` (desktop, phone, low-end, reduced motion) and
  `HeroObjectsPoster` (which still each width gets, and that its `picture` holds
  only sources and an `img`). They sit on the page's white, not the old mint
  wash.

## Behaviour by device

- **Desktop (`lg`+):** the index, the steps and one phone (see How it works).
  The phone is sticky in the right half: it starts at the top of the steps,
  pins at mid-screen and lets go when the last step ends.
- **Below `lg`:** no pinned phone. The index is a row under the header; each
  step is its text followed by its own phone, which plays once a third of it is
  on screen and resets only after it has left. The scene shows two props
  (`COMPACT_OBJECTS`: the pin and the toolbox).
- **Reduced motion / no WebGL / no JS:** no canvas. The hero shows the still
  poster and phone screens show their finished state (the post screen rests as
  its form, with a still ring on its hotspot: its finished state would cover its
  first field). Every transition inside the phone is zeroed by `PhoneFrame`; the
  index does not animate.

## Updating the poster

`HeroObjectsPoster` is a `picture` of four stills, widest first (the first
`media` that matches wins; the `img` is the phone's), each rendered from the
live scene at its own size so the objects sit where the live scene puts them
there and `cover` crops only a little between sizes:

| Still | Screens | Story | Rendered at |
|-------|---------|-------|-------------|
| `hero-objects-large.webp` | 1700px and up | `PosterLarge` | 1920 x 1080, 1.25x |
| `hero-objects-wide.webp` | 1024 to 1699 | `PosterWide` | 1440 x 900, 1.5x |
| `hero-objects-middle.webp` | 768 to 1023 | `PosterMiddle` | 768 x 1024, 1.5x |
| `hero-objects-compact.webp` | below 768 | `PosterCompact` | 390 x 844, 1.5x |

Re-render them after changing the hero formation, the placement rules or the
models: screenshot the stories headlessly (Playwright with `omitBackground:
true`, at the size in the table, with the page, `body` and `#storybook-root`
backgrounds cleared) and save WebP files (quality 80, alpha 90) to
`public/images/landing/`. Look at them before committing: the objects should sit
where the live scene puts them at that size. The `img` is a plain element with
inline styles on purpose: a styled one puts a `<style>` tag between the
`source`s and the `img`, and the browser then fetches the wide still as well as
the one that applies (a story checks the `picture` holds only sources and an
`img`).

## Brand tokens

UI references SDL semantic tokens only (`src/theme/chakraSystem.ts`). WebGL
can't read tokens, so `scene/scenePalette.ts` mirrors the SDL neutral ramp
(white and four zincs), the scene's ink and the brand green 400: the only raw
hex here (`scenePalette.test.ts` fails on any other).
**Green-ink rule:** green fills use dark ink text, never white.

## Deliberate calls

- Phone screens are lightweight replicas styled with SDL tokens, not the app
  components (those pull in Apollo, auth and routing). Keep them close to the
  real UI when the app changes: bottom bar, price pins, task detail, thread.
- The 3D tone mapping is Khronos PBR Neutral (ACES greyed the green).
- No environment map: the props are matte, so they have no reflections to
  build one for. A hemisphere light and two directional lights do the work.
- Demo people, tasks and prices are fictional and live in the i11n bag
  (`landing.phone`), in English and Traditional Chinese.
- **Eyebrows: partly done, the rest needs Ryan.** The spec wants every
  left-aligned section head to carry an eyebrow with a green 600 icon, and also
  allows no new strings beyond the how-it-works index's labels. Heads with an
  eyebrow today: the two acts (`landing.story.*.eyebrow`) and the pricing teaser
  (the nav's "Pricing", an existing string). Heads without: the bento (no head
  of its own, its cells' titles are the h2s), the trust row (no head), the map
  panel's title chip, `/pricing`'s two heads, `/about`'s four section heads (its
  two step groups have a group label, placed under the h2) and the legal rows.
  No existing string fits any of them ("For customers" over the bento would
  repeat the act's eyebrow right below it). The options for Ryan: (a) keep
  reusing existing strings where one fits and accept the rest, (b) allow a few
  new eyebrow strings in en and zh-HK, or (c) amend the spec to "eyebrows where
  a string exists". Decide before another round, so the sections are not
  reworked twice; if (b), each head only needs `eyebrow` and `icon` on its
  `SectionHead`.
