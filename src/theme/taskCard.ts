/**
 * Search task cards keep one height (FE-382, same rule as Expo FE-381).
 * Line counts are unitless. Heights are CSS lengths.
 */
export const taskCardLayout = {
  titleLines: 2,
  titleLineHeight: 1.3,
  metaLineHeight: 1.25,
  badgeRowMinHeight: '1.5rem',
} as const

export const taskCardTitleMinHeight = `${taskCardLayout.titleLines * taskCardLayout.titleLineHeight}em`
export const taskCardMetaMinHeight = `${taskCardLayout.metaLineHeight}em`
