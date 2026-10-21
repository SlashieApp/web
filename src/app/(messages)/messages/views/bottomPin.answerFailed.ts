import type { BottomPinViewConfig } from './types'

/** They marked it Failed: mark it Done if it went ahead, or Failed too. */
export const bottomPinAnswerFailed: BottomPinViewConfig = {
  subline: true,
  controls: 'close',
}
