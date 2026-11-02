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
 * Only when even that does not fit (the title block alone, the bar and a body
 * of any use are more than the window leaves: a wrapped two row bar, a very
 * large text size, a window a few lines tall) does the dialog scroll as a
 * whole (round 8, `dialogScrollsWhole`), so nothing is pushed out of the
 * frame. The same numbers decide it, so a window the app's `Dialog` can lay
 * out with its title and bar fixed is laid out the same way here.
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

/**
 * The title block's height without the description: what the header is when the
 * description is in the body. When the description is in the header the header
 * is the title block, `titleToSubtitle` (8) and the description, so it is that
 * much less. Read from the DOM as measured (where the description is when it
 * was measured), not from the layout's state, so a measurement taken while the
 * description moves is still the title block's.
 */
export function bareHeaderHeight({
  header,
  description,
  descriptionInHeader,
}: {
  header: number
  description: number
  descriptionInHeader: boolean
}): number {
  return descriptionInHeader
    ? header - formSpace.titleToSubtitle - description
    : header
}

export type WholeScrollInput = {
  /** `bareHeaderHeight`: the title block alone. */
  bareHeader: number
  /** The bar's measured height, 0 when the dialog has none. */
  footer: number
  /** `minBodyHeight` for this dialog. */
  minBody: number
  /** The room inside the panel: its maximum height less its border. */
  available: number
}

/**
 * Whether the dialog has to scroll as a whole (round 8). The title and the bar
 * stay put, and only the body scrolls between them, whenever the title block,
 * the bar and a body of any use (`minBodyHeight`) fit the room; the description
 * is in the body when it cannot be pinned (`descriptionFitsPinned`). Only past
 * that, where the body would be squeezed to nothing between the two (a bar that
 * wraps to two rows, a very large text size, a window a few lines tall), the
 * whole dialog scrolls, the buttons reachable at the end.
 *
 * None of the numbers depends on where the description is, and the scroll
 * itself can only make them larger (a scrollbar on a whole-scrolling dialog
 * narrows the bar, which can only wrap it), so the answer does not chase its own
 * layout.
 */
export function dialogScrollsWhole({
  bareHeader,
  footer,
  minBody,
  available,
}: WholeScrollInput): boolean {
  return bareHeader + footer + minBody > available
}
