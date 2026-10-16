import { customerBody } from './shared'
import type { PublicProfilePageConfig } from './types'

/** Anyone but the owner on a customer profile. The task cards are the action. */
export const customerVisitor: PublicProfilePageConfig = {
  ...customerBody,
  ownerBar: false,
  report: true,
  activity: false,
}
