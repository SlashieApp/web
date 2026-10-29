import type { SystemStyleObject } from '@chakra-ui/react'

/**
 * SDL elevation scale (light mode): a hairline first, then the least shadow
 * that does the job, in ink at low alpha. `e3` and `e4` carry their own 1px
 * ring, so a surface that uses them has no border of its own. Dark mode prefers
 * a lighter surface + 1px border over heavy shadow; components handle that via
 * `border.default`.
 *
 *   e1  cards at rest (with a 1px `border.default`)
 *   e2  hover, raised
 *   e3  floating chrome, menus, popovers (ring, no border)
 *   e4  drawers, sheets (ring, no border)
 *   e5  dialogs
 */
export const sdlElevation = {
  e1: '0 1px 2px rgba(10, 21, 18, 0.04), 0 2px 10px rgba(10, 21, 18, 0.05)',
  e2: '0 2px 4px rgba(10, 21, 18, 0.05), 0 6px 16px rgba(10, 21, 18, 0.07)',
  e3: '0 0 0 1px rgba(10, 21, 18, 0.06), 0 8px 24px rgba(10, 21, 18, 0.08)',
  e4: '0 0 0 1px rgba(10, 21, 18, 0.04), 0 16px 40px rgba(10, 21, 18, 0.12)',
  e5: '0 25px 50px -12px rgba(10, 21, 18, 0.25)',
} as const

/**
 * Font stacks. `--font-geist` and `--font-geist-mono` are set on `<html>` by
 * next/font (`src/app/layout.tsx`), where Chakra resolves its font tokens.
 * Geist has no CJK glyphs, so zh-HK falls back to the system font.
 */
export const sdlFonts = {
  sans: 'var(--font-geist), "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  mono: 'var(--font-geist-mono), "Geist Mono", ui-monospace, "SF Mono", Menlo, monospace',
} as const

/** SDL motion. Animate transform/opacity only; honor prefers-reduced-motion. */
export const sdlMotion = {
  duration: {
    instant: '75ms',
    fast: '100ms',
    base: '150ms',
    moderate: '200ms',
    slow: '300ms',
    map: '500ms',
  },
  easing: {
    standard: 'cubic-bezier(0.2, 0, 0, 1)',
    decelerate: 'cubic-bezier(0, 0, 0, 1)',
    accelerate: 'cubic-bezier(0.3, 0, 1, 1)',
    /** Confirmation moments only (quote accepted, job closed). */
    emphasis: 'cubic-bezier(0.2, 0, 0, 1.2)',
  },
} as const

/** One step of the type scale. */
type SdlTypeStep = {
  fontSize: string
  lineHeight: string
  fontWeight: 400 | 500
  letterSpacing: string
  textTransform?: 'uppercase'
  /** Size and line height below `md`, when a phone differs. */
  phone?: { fontSize: string; lineHeight: string }
}

/**
 * SDL type scale: role → size / line height / weight / tracking (tone refresh,
 * Train 1). Every heading is 500 and none is heavier. Prices, counts and other
 * figures are 600 with tabular figures where they are set, not in a role.
 * Consumed by Chakra `textStyles` + docs. The eyebrow's colour is `text.subtle`,
 * set where it is used.
 */
export const sdlTypeScale = {
  'display-2xl': {
    fontSize: '72px',
    lineHeight: '72px',
    fontWeight: 500,
    letterSpacing: '-0.045em',
    phone: { fontSize: '44px', lineHeight: '46px' },
  },
  'display-xl': {
    fontSize: '56px',
    lineHeight: '58px',
    fontWeight: 500,
    letterSpacing: '-0.04em',
  },
  'display-lg': {
    fontSize: '44px',
    lineHeight: '48px',
    fontWeight: 500,
    letterSpacing: '-0.035em',
  },
  'heading-xl': {
    fontSize: '34px',
    lineHeight: '41px',
    fontWeight: 500,
    letterSpacing: '-0.03em',
  },
  'heading-lg': {
    fontSize: '24px',
    lineHeight: '30px',
    fontWeight: 500,
    letterSpacing: '-0.02em',
  },
  'heading-md': {
    fontSize: '20px',
    lineHeight: '26px',
    fontWeight: 500,
    letterSpacing: '-0.015em',
  },
  'heading-sm': {
    fontSize: '18px',
    lineHeight: '24px',
    fontWeight: 500,
    letterSpacing: '-0.01em',
  },
  'text-lg': {
    fontSize: '18px',
    lineHeight: '28px',
    fontWeight: 400,
    letterSpacing: '0',
  },
  'text-md': {
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 400,
    letterSpacing: '0',
  },
  'text-sm': {
    fontSize: '14px',
    lineHeight: '21px',
    fontWeight: 400,
    letterSpacing: '0',
  },
  'text-xs': {
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 500,
    letterSpacing: '0',
  },
  'label-md': {
    fontSize: '14px',
    lineHeight: '17px',
    fontWeight: 500,
    letterSpacing: '0',
  },
  'label-sm': {
    fontSize: '12px',
    lineHeight: '14px',
    fontWeight: 500,
    letterSpacing: '0.02em',
  },
  eyebrow: {
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  'mono-sm': {
    fontSize: '14px',
    lineHeight: '21px',
    fontWeight: 500,
    letterSpacing: '0',
  },
} as const satisfies Record<string, SdlTypeStep>
export type SdlTypeRole = keyof typeof sdlTypeScale

/** SDL spacing scale (px), 4px base. Mirrors Chakra default spacing tokens. */
export const sdlSpace = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const

/**
 * SDL form spacing (FE-481): one set of gaps for every form. The keys and
 * values are the same in the Expo app (`src/theme/spacing.ts`); the spec is the
 * wiki note Foundations-Form-Spacing. Every value sits on the 4px scale above.
 * Gaps are measured between the visible edges of the elements, so a hit area
 * larger than its visual (a checkbox row, an inline link) adds no space.
 *
 * `chakraSystem` exposes them as Chakra tokens: the gaps as `spacing.form.*`
 * (`gap="form.fieldGap"`) and the height as `sizes.form.controlHeight`
 * (`minH="form.controlHeight"`). Components and screens read the token, never
 * a step or a px for a form gap.
 */
export const formSpace = {
  /** A form title and its subtitle or description. */
  titleToSubtitle: 8,
  /** The header block and the first field (or first block). */
  headerToBody: 24,
  /** A label and its control (input, select, checkbox group, composite field). */
  labelToControl: 8,
  /** One field group and the next, including checkbox rows, Turnstile and form-level notes or errors. */
  fieldGap: 20,
  /** A control and its helper, error or inline link ("Forgot password?"). */
  controlToHelper: 4,
  /** A helper and an error, when both show (helper first). */
  helperGap: 4,
  /** The last field (or its helper) and the main button. */
  bodyToAction: 20,
  /** The main button and the "Or continue with" divider. */
  actionToDivider: 24,
  /** The divider and the first alternative button. */
  dividerToAlternatives: 24,
  /** Stacked alternative or secondary buttons (Google and Apple; Continue and Resend). */
  alternativesGap: 8,
  /** One section and the next in a long form (no dividing lines). */
  sectionGap: 32,
  /** A section title and its first field. */
  sectionTitleToField: 12,
  /** Fields side by side (Min and Max, From and To, First and Last name). */
  inlineGap: 12,
  /** Fields, main buttons and the Google and Apple buttons in forms. */
  controlHeight: 48,
} as const

export type FormSpaceKey = keyof typeof formSpace

/** Every `formSpace` key that is a gap (all but the control height). */
export type FormGapKey = Exclude<FormSpaceKey, 'controlHeight'>

/**
 * Helper copy under a field. Its line height is compact (20px, the label's own)
 * where Chakra's `tall` would be 22.75px, so the 4px under the control reads as
 * 4. The error line (12/16) is already compact.
 */
export const formHelperTextStyle = {
  fontSize: 'sm',
  lineHeight: '20px',
  color: 'text.muted',
} as const satisfies SystemStyleObject

/** SDL radii (px). */
export const sdlRadii = {
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const

/**
 * Shared card / overlay recipe. Resting cards, map chrome, auth panels, and
 * dashboard blocks all use this — do not invent a second radius or shadow.
 *
 *   rest     e1  — task/auth/dashboard cards on the page canvas
 *   raised   e2  — hover, selected, sticky
 *   overlay  e3  — floating map chrome (filters, empty state, search loader)
 */
export const sdlCard = {
  radius: 'lg',
  shadow: 'e1',
  raisedShadow: 'e2',
  overlayShadow: 'e3',
} as const

/** Hairline + rest elevation. Spread onto Box when `<Card>` is not the host. */
export const sdlCardSurface: SystemStyleObject = {
  bg: 'bg.surface',
  borderWidth: '1px',
  borderColor: 'border.default',
  borderRadius: sdlCard.radius,
  boxShadow: sdlCard.shadow,
}

/**
 * Same surface, lifted for chrome that floats over the map. `e3` carries its own
 * 1px ring, so it has no border of its own.
 */
export const sdlOverlaySurface: SystemStyleObject = {
  ...sdlCardSurface,
  borderWidth: 0,
  boxShadow: sdlCard.overlayShadow,
}

/**
 * Prices, counts and other figures: weight 600 with tabular figures. Spread it
 * onto the `Text` that holds the number.
 */
export const sdlFigure = {
  fontWeight: 600,
  fontVariantNumeric: 'tabular-nums',
} as const satisfies SystemStyleObject

/**
 * The eyebrow: a small uppercase label above a heading (12/16, 500, +0.08em),
 * in `text.subtle`. The `eyebrow` text style cannot carry a colour.
 */
export const sdlEyebrow = {
  textStyle: 'eyebrow',
  color: 'text.subtle',
} as const satisfies SystemStyleObject

/**
 * Support-copy colors on dark surfaces that must meet WCAG AA on their paired
 * surfaces. `chakraSystem` semantic tokens consume these; do not re-type the
 * hex. (Light support copy is the `text.subtle` role: `#6B6B74`, AA on white,
 * `#FAFAFA` and `#F4F4F5`.)
 */
export const sdlTextAa = {
  /** ≥4.5:1 on `bg.inverted` / `bg.invertedSurface`. */
  invertedMuted: '#D4D4D8',
  onBrandMuted: 'rgba(255, 255, 255, 0.88)',
  onBrandSubtle: 'rgba(255, 255, 255, 0.82)',
} as const

/**
 * Portalled overlays (Modal / Drawer / ReportDialog) must sit above Header
 * (30), the mobile dock (40), and dropdowns (50). #217 dropped this and the
 * report scrim lost to page chrome.
 */
export const APP_OVERLAY_Z_INDEX = 1400 as const

/** Keyboard `:focus-visible` mirrors mouse `:hover`; suppress default focus ring. */
export const focusRingless = {
  outline: 'none',
  boxShadow: 'none',
} as const

export function focusVisibleMatchesHover(
  hover: SystemStyleObject,
): Pick<SystemStyleObject, '_focus' | '_focusVisible'> {
  return {
    _focus: focusRingless,
    _focusVisible: { ...hover, ...focusRingless },
  }
}

/**
 * SDL visible focus ring: 2px ring + 2px offset using `border.focus`.
 * Used by interactive atoms for WCAG 2.2 AA focus visibility.
 */
export const sdlFocusRing: SystemStyleObject = {
  outline: '2px solid',
  outlineColor: 'border.focus',
  outlineOffset: '2px',
}

/**
 * Bordered form shells (`Input`, `Select`). SDL inputs: 8px corners, a 1px
 * `border.strong` hairline and no shadow; the border steps to `border.hover`.
 */
export const formControlShellInteraction = {
  transitionProperty: 'border-color, box-shadow',
  transitionDuration: sdlMotion.duration.moderate,
  _hover: {
    borderColor: 'border.hover',
  },
  _focusWithin: {
    borderColor: 'border.focus',
    boxShadow: '0 0 0 2px var(--chakra-colors-border-focus)',
  },
} satisfies SystemStyleObject

/** Native field inside a bordered shell — ring handled by the shell. */
export const formControlFieldRingless = {
  outline: 'none',
  fontSize: '16px',
  _focus: focusRingless,
  _focusVisible: focusRingless,
} satisfies SystemStyleObject

/** Error border treatment shared by form controls when `invalid`. */
export const formControlInvalidBorder = {
  borderColor: 'status.danger.solid',
  _hover: { borderColor: 'status.danger.solid' },
} satisfies SystemStyleObject

/** Error border for bordered control shells (`Input`, `Select`). */
export function formControlInvalidShellStyles(
  invalid: boolean,
): SystemStyleObject {
  if (!invalid) return {}
  return {
    ...formControlInvalidBorder,
    _focusWithin: {
      borderColor: 'status.danger.solid',
      boxShadow: '0 0 0 2px var(--chakra-colors-status-danger-solid)',
    },
  }
}

/** Error border for standalone bordered fields (`Textarea`, `OtpInput`). */
export function formControlInvalidFieldStyles(
  invalid: boolean,
): SystemStyleObject {
  if (!invalid) return {}
  return {
    ...formControlInvalidBorder,
    _focusVisible: {
      borderColor: 'status.danger.solid',
      boxShadow: '0 0 0 2px var(--chakra-colors-status-danger-solid)',
      outline: 'none',
    },
  }
}

/** Focus ring for solid danger buttons (uses the `status.danger.ring` token). */
export const statusDangerSolidFocusRing: SystemStyleObject = {
  outline: 'none',
  boxShadow: '0 0 0 4px var(--chakra-colors-status-danger-ring)',
}

/**
 * Pointer-down scale for Button, IconButton, interactive Card, and the mobile
 * dock. Same `:active` transform idea as Thumbnail / Logo, at the Apple press
 * size: 0.97 over 100ms. Color, shadow, and focus rings stay on the caller.
 * Disabled controls are excluded. Reduced motion drops the scale entirely.
 */
export const SDL_PRESS_SCALE = 'scale(0.97)' as const

const PRESS_ACTIVE_SELECTOR =
  '&:active:not(:disabled):not([data-disabled]):not([aria-disabled="true"]):not([data-loading])'

const REDUCED_MOTION_QUERY = '@media (prefers-reduced-motion: reduce)'

/**
 * Append a 100ms transform timing to an existing color/shadow transition.
 * `transform` is listed once, last, so a caller can keep its own durations.
 */
export function sdlTransitionWithPress(
  properties: string,
  colorDuration: string = sdlMotion.duration.moderate,
  easing: string = sdlMotion.easing.standard,
): SystemStyleObject {
  const list = [
    ...new Set(
      properties
        .split(',')
        .map((part) => part.trim())
        .filter((part) => part.length > 0 && part !== 'transform'),
    ),
    'transform',
  ]

  return {
    transformOrigin: 'center',
    transitionProperty: list.join(', '),
    transitionDuration: list
      .map((property) =>
        property === 'transform' ? sdlMotion.duration.fast : colorDuration,
      )
      .join(', '),
    transitionTimingFunction: list.map(() => easing).join(', '),
  }
}

/** `:active` scale. `target` scales a descendant (nav tile) instead of the hit area. */
export function sdlPressActiveCss(target?: string): SystemStyleObject {
  const selector = target
    ? `${PRESS_ACTIVE_SELECTOR} ${target}`
    : PRESS_ACTIVE_SELECTOR

  // Computed selectors are valid Chakra `css` keys (`&…`, `@media …`) but
  // too wide for `SystemStyleObject`'s selector map, so the object is asserted.
  return {
    [selector]: {
      transform: SDL_PRESS_SCALE,
      transformOrigin: 'center',
    },
    [REDUCED_MOTION_QUERY]: {
      [selector]: { transform: 'none' },
    },
  } as SystemStyleObject
}

/**
 * Merge press-scale onto a `css` prop. An existing reduced-motion block is
 * kept and extended so caller rules are not replaced.
 */
export function mergeSdlPressCss(
  css?: SystemStyleObject | readonly SystemStyleObject[] | null,
  target?: string,
): SystemStyleObject {
  const press = sdlPressActiveCss(target)
  const layers = (Array.isArray(css) ? css : [css]).filter(
    (layer): layer is SystemStyleObject =>
      layer != null && typeof layer === 'object',
  )
  const base: SystemStyleObject = {}
  for (const layer of layers) Object.assign(base, layer)
  const baseMedia = base[REDUCED_MOTION_QUERY]
  const pressMedia = press[REDUCED_MOTION_QUERY]
  const media =
    baseMedia &&
    pressMedia &&
    typeof baseMedia === 'object' &&
    typeof pressMedia === 'object'
      ? { [REDUCED_MOTION_QUERY]: { ...baseMedia, ...pressMedia } }
      : null

  return {
    ...base,
    ...press,
    ...media,
  }
}

/** Standalone bordered field (`Textarea`, `OtpInput`), as the shell above. */
export const formControlFieldInteraction = {
  outline: 'none',
  fontSize: '16px',
  transitionProperty: 'border-color, box-shadow',
  transitionDuration: sdlMotion.duration.moderate,
  _hover: {
    borderColor: 'border.hover',
  },
  _focus: focusRingless,
  _focusVisible: {
    borderColor: 'border.focus',
    outline: 'none',
    boxShadow: '0 0 0 2px var(--chakra-colors-border-focus)',
  },
} satisfies SystemStyleObject
