import { expect } from 'storybook/test'

import { STATUS_CARD_MAX_W_CSS } from '@/theme/pageContainer'

import { boxOf, expectPx, lines } from '../PageContainer/pageLines.testing'

/** The width of every centred card (R6), in px: 28rem, 448. */
export const STATUS_CARD_PX = Number.parseFloat(STATUS_CARD_MAX_W_CSS) * 16

/**
 * R6, the width part: a box is `STATUS_CARD_PX` wide and centred in the
 * window (the container is centred in it), or the whole container when the
 * window is narrower than the card plus the gutters. Story helper, not in the barrel.
 */
export function expectCentredBox(
  canvasElement: HTMLElement,
  card: Element,
  message = 'card',
) {
  const { width, logo, menu } = lines(canvasElement)
  const box = boxOf(card)
  expectPx(box.width, Math.min(STATUS_CARD_PX, menu - logo), `${message} width`)
  expectPx(
    box.left + box.width / 2,
    width / 2,
    `${message} is centred in the window`,
  )
}

/**
 * Every StatusCard story runs this: the card is centred at 448 (R6), its
 * title is the one `h1` of the card and names it, and an unexpected error
 * (`alert`) announces itself from the card (never from a wrapper around the
 * `main`). A page has at most one `main`, with the card inside it; a card that
 * is the page (`page`: a `fullPage` card where no app shell gives the `main`)
 * must be that one `main`. Story helper, not in the barrel.
 */
export function expectCentredCardBox(
  canvasElement: HTMLElement,
  card: Element,
  message = 'card',
  options: { alert?: boolean; page?: boolean } = {},
) {
  expectCentredBox(canvasElement, card, message)
  const titles = card.querySelectorAll('h1')
  expect(titles, `${message} has one h1`).toHaveLength(1)
  expect(
    card.getAttribute('aria-labelledby'),
    `${message} is named by it`,
  ).toBe(titles[0]?.id)
  if (options.alert) {
    expect(card.getAttribute('role'), `${message} is an alert`).toBe('alert')
  }
  const mains = canvasElement.querySelectorAll('main')
  expect(mains.length, `${message}: one main at most`).toBeLessThanOrEqual(1)
  if (mains.length === 1) {
    expect(mains[0]?.contains(card), `${message} is inside the main`).toBe(true)
  }
  if (options.page) {
    expect(mains, `${message} is the page: its one main`).toHaveLength(1)
  }
}
