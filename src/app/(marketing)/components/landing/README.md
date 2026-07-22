# Slashie marketing landing

The `/` marketing page: a server-rendered narrative with a Spotlight + Spline
3D hero layered on top as a lazy client island. Lives inside the production app
(Chakra v3 + SDL tokens) — **no Tailwind, no styling-system fork**.

## Run / build

```bash
bun install
bun run dev        # http://localhost:3000/
bun run build
```

## Architecture

```
page.tsx                     server shell: metadata, live GraphQL pricing, section order
components/landing/
  LenisRoot.tsx              smooth scroll (landing only; skipped under reduced motion)
  Reveal.tsx                 IO-based scroll reveal — visible without JS, inert under reduced motion
  Magnetic.tsx               magnetic CTA wrapper (motion springs; mouse-only)
  hooks/useDeviceTier.ts     adaptive quality: high | mid | low | off
  hero/
    HeroSection.tsx          brand + headline + search CTA (left) over Spotlight/Spline (right)
    HeroSearchCta.tsx        primary search-bar CTA → register/create-task handoff
    HeroPoster.tsx           static ink atmosphere — no-JS / reduced-motion / mobile fallback
    Spotlight.tsx            ReactBits-style soft spotlight cone
    SplineScene.tsx          lazy @splinetool/react-spline wrapper
    HeroSplineLayer.tsx      client shell: tier + desktop gate, dynamic load, cross-fade
    splineScene.ts           scene URL constant (+ NEXT_PUBLIC_HERO_SPLINE_SCENE_URL override)
  sections/                  HowItWorks · Audience · Trust · PricingTeaser · FinalCtaBand
```

## Hero conversion

The primary CTA is the search bar. Submit routes:

- signed-in → `/tasks/create?title=…` (title omitted when empty)
- guest → `/register?next=/tasks/create?title=…`

Create-task reads `title` from the query to prefill the draft.

## Brand tokens

UI-side references SDL semantic tokens (`src/theme/chakraSystem.ts`). Mode-
independent inverted roles power the hero: `bg.inverted{,Surface,Raised}`,
`text.onInverted{,Muted,Link}`, `border.inverted`, `bg.glass`, `border.glass`.
**Green-ink rule**: green fills use dark ink text (`#0A1512`), never white.

## Device-tier / performance

`hooks/useDeviceTier.ts` gates the Spline runtime. Spline mounts only when:

- viewport ≥ `md` (768px)
- tier is `mid` or `high` (not `off` / `low` / reduced-motion / no-WebGL)

The poster underneath is always present for LCP and tap safety on mobile.

## Deliberate calls / integration notes

- **Header**: shared `MarketingHeader` is transparent with inverted text over
  the hero on `/` only, solidifying after 24px of scroll. Header “Get started”
  remains register; hero conversion centers on search → post-task intent.
- **Landing stays public**: signed-in visitors are not auto-redirected away from `/`.
- Scroll storytelling uses IO + CSS + `motion` rather than GSAP.
- Temporary Spline scene URL is acceptable until a Slashie-branded worker scene
  ships — override via `NEXT_PUBLIC_HERO_SPLINE_SCENE_URL`.
