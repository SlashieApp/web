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
