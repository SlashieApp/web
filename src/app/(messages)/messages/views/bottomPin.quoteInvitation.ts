import type { BottomPinViewConfig } from './types'

/**
 * A customer asked this worker to quote (FE-507): Send a quote, or Not for me
 * (silent). No sub-line: the headline is who asked.
 */
export const bottomPinQuoteInvitation: BottomPinViewConfig = {
  subline: false,
  controls: 'invitation',
}
