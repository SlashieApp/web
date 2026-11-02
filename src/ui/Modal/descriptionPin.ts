import { formSpace } from '@/theme/styles'

/**
 * Where a `Modal` draws its description (FE-481 round 7). It is pinned under
 * the title, so the title block reads as one and the description never scrolls
 * away, while the dialog has room for the header with it, the bar and a body of
 * any use. Past that (a long description in a short window: a phone on its
 * side, a large text size, a very long sentence) it is the first block of the
 * scrolling body, 8 under the title where it was, with the 24 to the first
 * field (or the bar) after it. Either way no line of it is cut off and the
 * main button is never pushed out of the panel; the title and the bar stay put.
 *
 * The app's `Dialog` makes the same choice from the same numbers
 * (`src/ui/Dialog/descriptionPin.ts`): keep the two in step.
 */

/**
 * What the body needs beside a pinned header and bar to be of any use: the 24
 * under the header, one field, and the 20 above the bar. A confirm that is only
 * a sentence (no body) needs only the 24.
 */
export function minBodyHeight(hasBody: boolean): number {
  return hasBody
    ? formSpace.headerToBody + formSpace.controlHeight + formSpace.bodyToAction
    : formSpace.headerToBody
}

/**
 * Once the description has moved into the body, it goes back under the title
 * only when it would fit with this much to spare, so a window sitting on the
 * line does not flip it back and forth.
 */
export const REPIN_MARGIN = formSpace.alternativesGap

export type DescriptionPinInput = {
  /** Whether the description is under the title now (so `header` includes it). */
  pinned: boolean
  /** The header's measured height as drawn now: the title block, with the description if pinned. */
  header: number
  /** The description's own height, measured wherever it is drawn. 0: not measured yet. */
  description: number
  /** The bar's measured height, 0 when the dialog has none. */
  footer: number
  /** `minBodyHeight` for this dialog. */
  minBody: number
  /** The room inside the panel: its maximum height less its border. */
  available: number
}

/**
 * Whether the description fits pinned under the title with the bar and a useful
 * body, from what was measured. The header's height with the description is the
 * same number whichever way it is drawn (the title block, plus
 * `titleToSubtitle` (8), plus the description), so the answer does not depend
 * on where the description is now, and the layout does not chase its own
 * measurements.
 */
export function descriptionFitsPinned({
  pinned,
  header,
  description,
  footer,
  minBody,
  available,
}: DescriptionPinInput): boolean {
  // In the body but not measured yet: stay there until it is.
  if (!pinned && description <= 0) return false
  const pinnedHeader = pinned
    ? header
    : header + formSpace.titleToSubtitle + description
  const spare = pinned ? 0 : REPIN_MARGIN
  return pinnedHeader + footer + minBody + spare <= available
}
