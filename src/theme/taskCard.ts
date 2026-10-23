/**
 * Search task cards keep one narrow height (FE-384, same rule as Expo).
 * One title line, and a reserved badge and price row.
 * Line counts are unitless. Heights are CSS lengths.
 */
export const taskCardLayout = {
  titleLines: 1,
  titleLineHeight: 1.3,
  metaLineHeight: 1.25,
  badgeRowMinHeight: '1.5rem',
  thumb: '48px',
} as const

export const taskCardTitleMinHeight = `${taskCardLayout.titleLines * taskCardLayout.titleLineHeight}em`
export const taskCardMetaMinHeight = `${taskCardLayout.metaLineHeight}em`
