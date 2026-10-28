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
  // Link rows and Button rows share these props, and a Button has a 1px
  // border that a Link doesn't: without this its label sits 1px further in.
  borderWidth: 0,
  borderRadius: 'md',
  fontSize: 'sm',
  fontWeight: 500,
  color: 'text.default',
  _hover: navRowHover,
  ...focusVisibleMatchesHover(navRowHover),
  _currentPage: { bg: 'status.success.soft', color: 'status.success.fg' },
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
