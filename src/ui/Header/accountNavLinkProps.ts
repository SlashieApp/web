import { focusVisibleMatchesHover, navRowHover } from '../interactionStyles'

export const accountNavLinkRowProps = {
  display: 'flex',
  alignItems: 'center',
  w: 'full',
  minH: '44px',
  px: 3,
  py: 2,
  borderRadius: 'md',
  fontSize: 'sm',
  fontWeight: 600,
  color: 'cardFg',
  _hover: navRowHover,
  ...focusVisibleMatchesHover(navRowHover),
} as const

const logoutHover = {
  bg: 'badgeBg',
  textDecoration: 'none',
  color: 'red.700',
} as const

export const accountNavLogoutRowProps = {
  ...accountNavLinkRowProps,
  color: 'red.600',
  _hover: logoutHover,
  ...focusVisibleMatchesHover(logoutHover),
} as const
