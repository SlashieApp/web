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
  _hover: { bg: 'badgeBg', textDecoration: 'none', color: 'cardFg' },
} as const

export const accountNavLogoutRowProps = {
  ...accountNavLinkRowProps,
  color: 'red.600',
  _hover: { bg: 'badgeBg', textDecoration: 'none', color: 'red.700' },
} as const
