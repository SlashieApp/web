/**
 * Shared viewport split. Compact (phone + tablet) vs web/desktop is Chakra `lg`.
 *
 * Chakra v3 defaults `lg` at 1024px — not the older 62em / 992px token.
 * CSS media queries, JS width checks, and `lg:` props must all use this.
 */
export const BREAKPOINT_PX = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export const TABLET_MIN_PX = BREAKPOINT_PX.md
export const WEB_MIN_PX = BREAKPOINT_PX.lg

/** `(min-width: 1024px)` — web / split. Use with `@media screen and ${WEB_MQ}`. */
export const WEB_MQ = `(min-width: ${WEB_MIN_PX}px)` as const

/** `(min-width: 768px)` — tablet+ (Chakra `md`). */
export const TABLET_MQ = `(min-width: ${TABLET_MIN_PX}px)` as const

/** Explicit Chakra theme breakpoints so `lg:` cannot drift from JS/CSS. */
export const chakraBreakpoints = {
  sm: `${BREAKPOINT_PX.sm}px`,
  md: `${BREAKPOINT_PX.md}px`,
  lg: `${BREAKPOINT_PX.lg}px`,
  xl: `${BREAKPOINT_PX.xl}px`,
  '2xl': `${BREAKPOINT_PX['2xl']}px`,
} as const
