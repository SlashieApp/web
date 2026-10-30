/**
 * Layout measures for the form spacing stories (FE-481). Gaps are measured
 * between the visible edges of two elements, as the spec does.
 */

const round = (value: number) => Math.round(value * 100) / 100

/** Vertical gap in px: the bottom edge of `upper` to the top edge of `lower`. */
export function gapBelow(upper: Element, lower: Element): number {
  return round(
    lower.getBoundingClientRect().top - upper.getBoundingClientRect().bottom,
  )
}

/** Horizontal gap in px: the right edge of `left` to the left edge of `right`. */
export function gapBeside(left: Element, right: Element): number {
  return round(
    right.getBoundingClientRect().left - left.getBoundingClientRect().right,
  )
}

export function heightOf(element: Element): number {
  return round(element.getBoundingClientRect().height)
}

/**
 * How far a press reaches a control, vertically, in px: the run of 1px steps
 * up and down its centre line where the element under the pointer is the
 * control or inside it. A grown pointer target (padding, kept out of the
 * layout) shows here, and so does a neighbour that covers part of it. Scrolls
 * the control to the middle of the window first (hit tests are window-bound).
 */
export function hitExtent(element: Element, reach = 80) {
  element.scrollIntoView({ block: 'center' })
  const rect = element.getBoundingClientRect()
  const x = rect.left + rect.width / 2
  const centre = rect.top + rect.height / 2
  const lands = (y: number) => {
    const hit = document.elementFromPoint(x, y)
    return hit !== null && element.contains(hit)
  }
  let top = Math.round(centre)
  while (top > centre - reach && lands(top - 1)) top -= 1
  let bottom = Math.round(centre)
  while (bottom < centre + reach && lands(bottom + 1)) bottom += 1
  return { top, bottom, height: bottom - top + 1 }
}
