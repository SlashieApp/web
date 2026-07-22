import { focusVisibleMatchesHover } from '@/theme/system'

const navRowHover = {
  bg: 'bg.subtle',
  textDecoration: 'none',
  color: 'text.default',
} as const

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
  color: 'text.default',
  _hover: navRowHover,
  ...focusVisibleMatchesHover(navRowHover),
} as const

const logoutHover = {
  bg: 'status.danger.soft',
  textDecoration: 'none',
  color: 'status.danger.fg',
} as const

export const accountNavLogoutRowProps = {
  ...accountNavLinkRowProps,
  color: 'status.danger.fg',
  _hover: logoutHover,
  ...focusVisibleMatchesHover(logoutHover),
} as const
