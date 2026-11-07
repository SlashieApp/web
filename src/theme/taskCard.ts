/**
 * Search task cards keep one narrow height (FE-384, same rule as Expo).
 * One title line, and a reserved badge and price row.
 * Line counts are unitless. Heights are CSS lengths.
 */
export const taskCardLayout = {
  titleLines: 1,
  titleLineHeight: 1.3,
  metaLineHeight: 1.25,
  // The small Badge's height (FE-442): 26px, so a card with a badge is no
  // taller than one without.
  badgeRowMinHeight: '1.625rem',
  /**
   * The photo (FE-502, Ryan 2026-11-07): the card's left side, edge to edge
   * from its top to its bottom, 96 wide, cropped to fit.
   */
  photoWidth: '96px',
} as const

export const taskCardTitleMinHeight = `${taskCardLayout.titleLines * taskCardLayout.titleLineHeight}em`
export const taskCardMetaMinHeight = `${taskCardLayout.metaLineHeight}em`
