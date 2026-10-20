import { customerOwner } from './customer.owner'
import type { PublicProfilePageConfig } from './types'
import { workerOwner } from './worker.owner'

/** Your own private worker profile: the owner preview under a hidden notice. */
export const workerOwnerHidden: PublicProfilePageConfig = {
  ...workerOwner,
  ownerBar: 'hidden',
}

/** Your own private customer profile: the owner preview under a hidden notice. */
export const customerOwnerHidden: PublicProfilePageConfig = {
  ...customerOwner,
  ownerBar: 'hidden',
}
