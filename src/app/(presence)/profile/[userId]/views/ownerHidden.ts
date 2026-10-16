import type { PublicProfileStatusConfig } from './types'

/** You opened your own link while your profile is private. */
export const ownerHidden: PublicProfileStatusConfig = {
  layout: 'status',
  copy: 'hidden',
  action: 'profileSettings',
}
