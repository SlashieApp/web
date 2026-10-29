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
  the rails. `home/page.tsx` puts one between each section it assembles.
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
