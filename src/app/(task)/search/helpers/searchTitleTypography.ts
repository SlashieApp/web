/** Task-detail-style heading tokens for /search mode words and list titles. */
export const searchProminentHeadingProps = {
  fontFamily: 'heading',
  fontWeight: 700,
  lineHeight: 'short',
  letterSpacing: '-0.02em',
  color: 'text.default',
} as const

export const searchModeWordHeadingProps = {
  ...searchProminentHeadingProps,
  fontSize: { base: 'xl', md: '2xl' },
} as const

/** Same scale as mode words — list result headings (“24 tasks near London”). */
export const searchListTitleHeadingProps = searchModeWordHeadingProps
