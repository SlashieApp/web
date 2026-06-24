# SDL Token Migration — legacy → SDL mapping contract

Authoritative, deterministic mapping from the **old TypeUI-overlay tokens** to the
**Slashie Design Language (SDL)** semantic roles defined in
[`src/theme/chakraSystem.ts`](../src/theme/chakraSystem.ts).

**Rules for every migrated file**
- Components/pages reference **semantic roles only** (`action.primary`, `text.default`,
  `border.strong`, `status.danger.fg`, …). Never a primitive (`green.400`) or raw hex.
- Raw consumers (Mapbox/SVG/meta) may use `src/theme/brand.ts` constants only.
- GREEN-INK RULE: any green fill → `color="text.onGreen"`, never white.
- Status must show **dot/icon + label**, never color alone.
- If a usage is genuinely ambiguous, pick the closest role below and add
  `/* TODO(sdl): verify role */`. The verify phase greps for these.

## Semantic (flat) tokens

| Legacy | SDL role |
| --- | --- |
| `bg` | `bg.canvas` |
| `primary` | `action.primary` |
| `primaryHover` | `action.primaryHover` |
| `secondary` | `text.link` (green-700 `#048654`) |
| `tertiary` | `status.info.solid` |
| `surfaceHover` | `bg.subtle` |
| `badgeBg` | `status.success.soft` |
| `badgeFg` | `status.success.fg` |

## Card surface tokens

| Legacy | SDL role |
| --- | --- |
| `cardBg` | `bg.surface` |
| `cardBorder` | `border.default` |
| `cardDivider` | `border.default` |
| `cardFg` / `cardStrongFg` | `text.default` |
| `cardMutedFg` | `text.muted` |
| `cardAccentFg` | `text.link` |
| `cardIconPodBg` | `status.success.soft` |
| `cardIconPodFg` | `status.success.fg` |
| `cardAvatarEmpty` / `cardAvatarMore` | `bg.subtle` |

## Form control tokens

| Legacy | SDL role |
| --- | --- |
| `formControlBg` | `bg.surface` |
| `formControlFg` | `text.default` |
| `formControlBorder` | `border.default` |
| `formControlBorderStrong` | `border.strong` |
| `formControlFocusBorder` | `border.focus` |
| `formControlPlaceholder` | `text.subtle` |
| `formControlIcon` | `text.muted` |
| `formLabelMuted` / `formHelperMuted` | `text.muted` |

## Intent + status tokens

| Legacy | SDL role |
| --- | --- |
| `intentPrimaryFg` / `intentPrimaryIcon` | `status.success.fg` |
| `intentPrimaryBg` | `status.success.soft` |
| `intentPrimaryBorder` | `green.200` (border tint) |
| `intentTertiaryFg` | `status.info.fg` |
| `intentTertiaryBg` | `status.info.soft` |
| `intentTertiaryBorder` | `status.info.solid` |
| `intentDangerFg` | `status.danger.fg` |
| `intentDangerBg` | `status.danger.soft` |
| `intentDangerBorder` | `status.danger.solid` |
| `statusSuccessBg/Fg/Border/Solid` | `status.success.soft/fg/solid/solid` |
| `statusInfoBg/Fg/Border` | `status.info.soft/fg/solid` |
| `statusWarningBg/Fg/Border` | `status.warning.soft/fg/solid` |
| `statusDangerBg/Fg/Border/Solid` | `status.danger.soft/fg/solid/solid` |

## Primitive color scales

| Legacy | SDL |
| --- | --- |
| `primary.{50..900}` | `green.{50..900}` (index-preserving) |
| `linkBlue.{n}` | `green.{n}` (was already green) |
| `secondary.{n}` / `tertiary.{n}` | `green.{n}` (accent) or `info.solid` (blue accents) |
| `neutral.{0..900}` | `neutral.{0..900}` (index-preserving; SDL ramp) |
| `ink.700/800/900` | `neutral.800` / `neutral.900` / `neutral.900` |
| `mustard.400` | `status.warning.solid` |
| `mustard.500/600` | `status.warning.fg` |
| `mustard.50/100` | `status.warning.soft` |

## Raw hex / literals (apply by role)

| Hex / literal | SDL role |
| --- | --- |
| `#00DC82` `#00dc82` `#00AB63` `#00C275` (green fills) | `action.primary` (fill) / `text.link` (text) |
| `white` `#fff` `#ffffff` on a green fill | `text.onGreen` |
| `white` `#fff` `#ffffff` as a surface | `bg.surface` |
| `#0B1714` `#0A1512` (ink text) | `text.default` |
| `#6B7370` `#515A56` (muted) | `text.muted` |
| `#9BA4A0` (subtle) | `text.subtle` |
| `#E5E7EB` `#E0E5E3` (hairline) | `border.default` |
| `#D1D5DB` `#C7CECB` (strong border) | `border.strong` |
| `#F7F9F8` (canvas) | `bg.canvas` |
| `#EEF1F0` (subtle bg) | `bg.subtle` |

## Shadows / radii / motion

| Legacy | SDL |
| --- | --- |
| `boxShadow="xs"` | `e1` (or keep `xs` alias) |
| `boxShadow="sm/md/lg/xl"` | `e2/e3/e4/e5` |
| hardcoded transition `200ms` | `sdlMotion.duration.moderate` |
| ad-hoc cubic-bezier | `sdlMotion.easing.standard` |
| radius `8/12/16/20` | `md/lg/xl/2xl` |

## TaskStatus → StatusPill family

| TaskStatus | Family | Dot/icon |
| --- | --- | --- |
| `OPEN` | success | green dot |
| `AWARDED` | warning | amber dot |
| `CLOSED` | info | blue dot |
| `CANCELLED` | danger | red dot |
