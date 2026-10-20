import { customerBody } from './shared'
import type { PublicProfilePageConfig } from './types'

/** Your own customer profile: what visitors see, then Your activity. */
export const customerOwner: PublicProfilePageConfig = {
  ...customerBody,
  ownerBar: 'public',
  report: false,
  activity: true,
}
