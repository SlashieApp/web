import { STATUS_CARD_MAX_W_CSS } from '@/theme/pageContainer'

import { boxOf, expectPx, lines } from '../PageContainer/pageLines.testing'

/** The width of every centred card (R6), in px: 28rem, 448. */
export const STATUS_CARD_PX = Number.parseFloat(STATUS_CARD_MAX_W_CSS) * 16

/**
 * R6: a centred card is `STATUS_CARD_PX` wide and centred in the window (the
 * container is centred in it), or the whole container when the window is
 * narrower than the card plus the gutters. Story helper, not in the barrel.
 */
export function expectCentredCardBox(
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
