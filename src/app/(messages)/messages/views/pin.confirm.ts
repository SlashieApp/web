import type { ThreadPinViewConfig } from './types'

/** They marked it Done or Failed: what happens next, and slide to mark Done. */
export const pinConfirm: ThreadPinViewConfig = {
  ask: true,
  pill: null,
  headline: true,
  subline: true,
  facts: null,
  controls: 'close',
}
