import type { SystemStyleObject } from '@chakra-ui/react'

/**
 * SDL elevation scale (light mode). Dark mode prefers a lighter surface + 1px
 * border over heavy shadow; components handle that via `border.default`.
 */
export const sdlElevation = {
  e1: '0 1px 2px rgba(10, 21, 18, 0.06)',
  e2: '0 2px 8px rgba(10, 21, 18, 0.08)',
  e3: '0 8px 24px rgba(10, 21, 18, 0.10)',
  e4: '0 16px 40px rgba(10, 21, 18, 0.14)',
  e5: '0 24px 64px rgba(10, 21, 18, 0.18)',
} as const

/** @deprecated SDL uses `sdlElevation`. Kept as an alias during migration. */
export const dsShadows = {
  xs: sdlElevation.e1,
  sm: sdlElevation.e2,
  md: sdlElevation.e3,
  lg: sdlElevation.e4,
  xl: sdlElevation.e5,
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

/** SDL type scale — role → size/line-height/weight. Consumed by Text/Heading + docs. */
export const sdlTypeScale = {
  'display-xl': { fontSize: '48px', lineHeight: '1.1', fontWeight: 700 },
  'display-lg': { fontSize: '36px', lineHeight: '1.15', fontWeight: 700 },
  'heading-xl': { fontSize: '28px', lineHeight: '1.2', fontWeight: 600 },
  'heading-lg': { fontSize: '24px', lineHeight: '1.25', fontWeight: 600 },
  'heading-md': { fontSize: '20px', lineHeight: '1.3', fontWeight: 600 },
  'heading-sm': { fontSize: '18px', lineHeight: '1.35', fontWeight: 600 },
  'text-lg': { fontSize: '18px', lineHeight: '1.55', fontWeight: 400 },
  'text-md': { fontSize: '16px', lineHeight: '1.5', fontWeight: 400 },
  'text-sm': { fontSize: '14px', lineHeight: '1.45', fontWeight: 400 },
  'text-xs': { fontSize: '12px', lineHeight: '1.35', fontWeight: 500 },
  'label-md': { fontSize: '14px', lineHeight: '1.2', fontWeight: 600 },
  'mono-sm': { fontSize: '14px', lineHeight: '1.5', fontWeight: 500 },
} as const
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

/** SDL radii (px). */
export const sdlRadii = {
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const

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

/** Bordered form shells (`Input`, `Select`) — SDL inputs. */
export const formControlShellInteraction = {
  boxShadow: 'e1',
  transitionProperty: 'border-color, box-shadow',
  transitionDuration: sdlMotion.duration.moderate,
  _hover: {
    borderColor: 'border.strong',
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

/** Standalone bordered field (`Textarea`, `OtpInput`). */
export const formControlFieldInteraction = {
  outline: 'none',
  boxShadow: 'e1',
  fontSize: '16px',
  transitionProperty: 'border-color, box-shadow',
  transitionDuration: sdlMotion.duration.moderate,
  _hover: {
    borderColor: 'border.strong',
  },
  _focus: focusRingless,
  _focusVisible: {
    borderColor: 'border.focus',
    outline: 'none',
    boxShadow: '0 0 0 2px var(--chakra-colors-border-focus)',
  },
} satisfies SystemStyleObject
