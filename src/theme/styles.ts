import type { SystemStyleObject } from '@chakra-ui/react'

/** shadows.md — shared shadow scale referenced by theme tokens */
export const dsShadows = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
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

/** Bordered form shells (`Input`, `Select`) — Design-System/inputs.md */
export const formControlShellInteraction = {
  boxShadow: 'xs',
  transitionProperty: 'border-color, box-shadow',
  transitionDuration: '200ms',
  _hover: {
    borderColor: 'formControlBorderStrong',
  },
  _focusWithin: {
    borderColor: 'formControlFocusBorder',
    boxShadow: '0 0 0 1px var(--chakra-colors-formControlFocusBorder)',
  },
} satisfies SystemStyleObject

/** Native field inside a bordered shell — ring handled by the shell. */
export const formControlFieldRingless = {
  outline: 'none',
  fontSize: '14px',
  _focus: focusRingless,
  _focusVisible: focusRingless,
} satisfies SystemStyleObject

/** Error border treatment shared by form controls when `invalid`. */
export const formControlInvalidBorder = {
  borderColor: 'statusDangerSolid',
  _hover: { borderColor: 'statusDangerSolid' },
} satisfies SystemStyleObject

/** Error border for bordered control shells (`Input`, `Select`). */
export function formControlInvalidShellStyles(
  invalid: boolean,
): SystemStyleObject {
  if (!invalid) return {}
  return {
    ...formControlInvalidBorder,
    _focusWithin: {
      borderColor: 'statusDangerSolid',
      boxShadow: '0 0 0 1px var(--chakra-colors-statusDangerSolid)',
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
      borderColor: 'statusDangerSolid',
      boxShadow: '0 0 0 1px var(--chakra-colors-statusDangerSolid)',
      outline: 'none',
    },
  }
}

/** Focus ring for solid danger buttons. */
export const statusDangerSolidFocusRing: SystemStyleObject = {
  outline: 'none',
  boxShadow: '0 0 0 4px var(--chakra-colors-statusDangerSolidFocusRing)',
}

/** Standalone bordered field (`Textarea`, `OtpInput`). */
export const formControlFieldInteraction = {
  outline: 'none',
  boxShadow: 'xs',
  fontSize: '14px',
  transitionProperty: 'border-color, box-shadow',
  transitionDuration: '200ms',
  _hover: {
    borderColor: 'formControlBorderStrong',
  },
  _focus: focusRingless,
  _focusVisible: {
    borderColor: 'formControlFocusBorder',
    outline: 'none',
    boxShadow: '0 0 0 1px var(--chakra-colors-formControlFocusBorder)',
  },
} satisfies SystemStyleObject
