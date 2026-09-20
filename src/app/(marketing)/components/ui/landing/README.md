# Slashie marketing landing

The `/` marketing page: a server-rendered narrative with a Spotlight + COBE
WebGL globe hero layered on top as a lazy client island. Lives inside the
production app (Chakra v3 + SDL tokens) — **no Tailwind, no styling-system fork**.

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
    HeroSection.tsx          brand + headline + search CTA (left) over Spotlight/COBE (right)
    HeroSearchCta.tsx        primary search-bar CTA → register/create-task handoff
    HeroPoster.tsx           static ink atmosphere — no-JS / reduced-motion fallback
    Spotlight.tsx            ReactBits-style soft spotlight cone
    HeroCobeGlobe.tsx        COBE WebGL globe + floating task labels
    heroGlobeMarkers.ts      demo pin lat/lon + brand colors
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

`hooks/useDeviceTier.ts` gates the COBE globe. WebGL mounts when:

- tier is not `off` (reduced-motion / no-WebGL stay on the static poster)
- `mid` / `high` auto-rotate; `low` shows a static globe

The poster underneath is always present for LCP and tap safety. The globe layer
is `pointer-events: none` so it never blocks the search CTA.

## Deliberate calls / integration notes

- **Header**: shared `MarketingHeader` is transparent with inverted text over
  the hero on `/` only, solidifying after 24px of scroll. Header “Get started”
  remains register; hero conversion centers on search → post-task intent.
- **Landing stays public**: signed-in visitors are not auto-redirected away from `/`.
- Scroll storytelling uses IO + CSS + `motion` rather than GSAP.
- Globe pins / labels are static marketing demo data (not live GraphQL).
