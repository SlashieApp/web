# Slashie marketing landing

The `/` marketing page: a server-rendered narrative with a WebGL "living map"
hero layered on top as a lazy client island. Lives inside the production app
(Chakra v3 + SDL tokens) — **no Tailwind, no styling-system fork**.

## Run / build

```bash
bun install
bun run dev        # http://localhost:3000/
bun run build      # production build (three.js is code-split off the main bundle)
```

## Architecture

```
page.tsx                     server shell: metadata, live GraphQL pricing, section order
components/landing/
  landingPalette.ts          WebGL-side colors (mirrors SDL tokens; the only sanctioned raw hex)
  LenisRoot.tsx              smooth scroll (landing only; skipped under reduced motion)
  Reveal.tsx                 IO-based scroll reveal — visible without JS, inert under reduced motion
  Magnetic.tsx               magnetic CTA wrapper (motion springs; mouse-only)
  hooks/useDeviceTier.ts     adaptive quality: high | mid | low | off (+ TIER_SETTINGS)
  hero/
    HeroSection.tsx          server-rendered copy + CTAs over the visual layers
    HeroPoster.tsx           static CSS/SVG hero — the no-JS / no-WebGL / reduced-motion fallback
    HeroCanvasLayer.tsx      client shell: tier gate, next/dynamic load, offscreen pause, cross-fade
    HeroCanvas.tsx           R3F canvas (dynamic-imported, ssr: false)
    HeroCursorGlow.tsx       pointer glow (native cursor untouched)
    scene/                   LivingMap (terrain shader) · Pins (£ beacons) · Signals
                             (cursor-reactive quote lines) · CameraRig
  sections/                  HowItWorks · Audience · Trust · PricingTeaser · FinalCtaBand
```

## Brand tokens

Everything UI-side references SDL semantic tokens (`src/theme/chakraSystem.ts`).
The landing added the mode-independent inverted roles: `bg.inverted{,Surface,Raised}`,
`text.onInverted{,Muted,Link}`, `border.inverted`. To retheme the WebGL scene,
edit `landingPalette.ts` — each constant documents the SDL token it mirrors.
**Green-ink rule** is enforced everywhere, including inside generated sprite
textures (`scene/textures.ts`: £ labels are ink `#0A1512` on green).

## Device-tier tuning

`hooks/useDeviceTier.ts` → `TIER_SETTINGS` controls DPR cap, particle/pin
counts, terrain density, and antialias per tier. `off` (reduced motion or no
WebGL) never loads the three.js chunk — the poster is the hero. The render
loop pauses (`frameloop="never"`) whenever the hero leaves the viewport.
Bloom is achieved with additive glow sprites rather than a post-processing
composer: an UnrealBloomPass through drei `Effects` bypasses three's output
color management (washed inks, verified by screenshot), while sprite glow
reads identically and costs almost nothing on low tiers.

## Deliberate calls / integration notes

- **Header**: shared `MarketingHeader` is transparent with inverted text over
  the hero on `/` only, solidifying after 24px of scroll; `/pricing`, `/about`,
  no-JS, and pre-hydration all render the solid header. Over the hero the
  header "Get started" is an inverted outline so the hero CTA stays the single
  green primary in the first viewport; it becomes the green primary once solid.
- **Custom cursor**: interpreted as a hero-scoped glow that trails the pointer;
  the native cursor is never replaced (a11y + platform affordances intact).
- **Pricing teaser** pulls live GraphQL pricing (`getPricingForPage`) — the one
  place plum (`accent.premium`) appears, per the premium-moment rule.
- **Landing stays public**: signed-in visitors are not auto-redirected away from `/`,
  routing, auth, and GraphQL are untouched; Lenis mounts only on the landing.
- Scroll storytelling uses IO + CSS + `motion` (already installed) rather than
  GSAP, per the approved lean dependency set (`three`, `@react-three/fiber`,
  `@react-three/drei`, `lenis`).
