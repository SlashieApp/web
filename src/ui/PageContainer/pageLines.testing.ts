import { expect } from 'storybook/test'

import { logoLineLeft, menuLineRight } from '@/theme/pageContainer'

/**
 * Story helpers for the layout rules: a window of a given width, and the
 * measures a play test checks a page against (the logo line and the menu
 * line, R1). Not part of the barrel.
 */

/** A story at a window `width` wide: spread it into the story. */
export function viewportAt(width: number, height = 900) {
  const key = `w${width}`
  return {
    parameters: {
      viewport: {
        options: {
          [key]: {
            name: `${width} wide`,
            styles: { width: `${width}px`, height: `${height}px` },
            type: width < 768 ? 'mobile' : 'desktop',
          },
        },
      },
    },
    globals: { viewport: { value: key, isRotated: false } },
  } as const
}

/** The window's width as the page sees it (a scrollbar would take from it). */
export const windowWidth = (canvasElement: HTMLElement) =>
  canvasElement.ownerDocument.documentElement.clientWidth

/** Where the logo line and the menu line are in this story's window. */
export function lines(canvasElement: HTMLElement) {
  const width = windowWidth(canvasElement)
  return { width, logo: logoLineLeft(width), menu: menuLineRight(width) }
}

/** Left, right and width of an element, as the page lays it out. */
export function boxOf(element: Element) {
  const { left, right, width } = element.getBoundingClientRect()
  return { left, right, width }
}

/** Rounded to a whole px, so a half-pixel of layout rounding is not a failure. */
export function expectPx(actual: number, expected: number, message?: string) {
  expect(Math.abs(actual - expected), message).toBeLessThanOrEqual(1)
}

/** The story really is this wide: a check that a story is not measuring another layout. */
export function expectWindowWidth(canvasElement: HTMLElement, width: number) {
  expect(windowWidth(canvasElement)).toBe(width)
}
