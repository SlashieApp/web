import type { SystemStyleObject } from '@chakra-ui/react'

const RINGLESS = {
  outline: 'none',
  boxShadow: 'none',
} as const

/** Keyboard `:focus-visible` mirrors mouse `:hover`; suppress default focus ring. */
export function focusVisibleMatchesHover(
  hover: SystemStyleObject,
): Pick<SystemStyleObject, '_focus' | '_focusVisible'> {
  return {
    _focus: RINGLESS,
    _focusVisible: { ...hover, ...RINGLESS },
  }
}

/** Tonal fill for ghost icon buttons and compact actions. */
export const ghostSurfaceHover = {
  bg: 'badgeBg',
  color: 'cardFg',
} satisfies SystemStyleObject

export const ghostSurfaceInteraction = {
  _hover: ghostSurfaceHover,
  ...focusVisibleMatchesHover(ghostSurfaceHover),
} satisfies SystemStyleObject

/** Inline text links (footer, subtle header links). */
export const textLinkHover = {
  textDecoration: 'none',
  color: 'primary.600',
} satisfies SystemStyleObject

export const textLinkInteraction = {
  _hover: textLinkHover,
  ...focusVisibleMatchesHover(textLinkHover),
} satisfies SystemStyleObject

/** Emphasized inline text links (account menu, membership). */
export const textLinkEmphasisHover = {
  color: 'primary.700',
  textDecoration: 'none',
} satisfies SystemStyleObject

export const textLinkEmphasisInteraction = {
  _hover: textLinkEmphasisHover,
  ...focusVisibleMatchesHover(textLinkEmphasisHover),
} satisfies SystemStyleObject

/** Muted inline link that brightens on hover/focus (e.g. “Back to browse”). */
export const mutedTextLinkHover = {
  textDecoration: 'none',
  color: 'cardFg',
} satisfies SystemStyleObject

export const mutedTextLinkInteraction = {
  _hover: mutedTextLinkHover,
  ...focusVisibleMatchesHover(mutedTextLinkHover),
} satisfies SystemStyleObject

/** Full-width drawer / account nav rows. */
export const navRowHover = {
  bg: 'badgeBg',
  textDecoration: 'none',
  color: 'cardFg',
} satisfies SystemStyleObject

export const navRowInteraction = {
  _hover: navRowHover,
  ...focusVisibleMatchesHover(navRowHover),
} satisfies SystemStyleObject

export function dashboardNavRowInteraction(active: boolean) {
  const hover = {
    textDecoration: 'none',
    bg: active ? 'primary.100' : 'badgeBg',
  } satisfies SystemStyleObject
  return {
    _hover: hover,
    ...focusVisibleMatchesHover(hover),
  }
}

export function navIconSurfaceInteraction(active: boolean) {
  const surface = {
    bg: active ? 'intentPrimaryBg' : 'badgeBg',
    color: active ? 'intentPrimaryFg' : 'cardFg',
  } satisfies SystemStyleObject
  return {
    _hover: surface,
    ...focusVisibleMatchesHover(surface),
  }
}

/** Bordered form shells (`Input`, `Select`). Hover + focus per inputs.md. */
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
  _focus: RINGLESS,
  _focusVisible: RINGLESS,
} satisfies SystemStyleObject

/** Standalone bordered field (`Textarea`). */
export const formControlFieldInteraction = {
  outline: 'none',
  boxShadow: 'xs',
  fontSize: '14px',
  transitionProperty: 'border-color, box-shadow',
  transitionDuration: '200ms',
  _hover: {
    borderColor: 'formControlBorderStrong',
  },
  _focus: RINGLESS,
  _focusVisible: {
    borderColor: 'formControlFocusBorder',
    outline: 'none',
    boxShadow: '0 0 0 1px var(--chakra-colors-formControlFocusBorder)',
  },
} satisfies SystemStyleObject
