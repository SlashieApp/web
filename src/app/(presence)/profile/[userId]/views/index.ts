import { customerOwner } from './customer.owner'
import { customerVisitor } from './customer.visitor'
import { loadError } from './loadError'
import { loading } from './loading'
import { customerOwnerHidden, workerOwnerHidden } from './ownerHidden'
import type { PublicProfileViewConfig, PublicProfileViewName } from './types'
import { unavailable } from './unavailable'
import { workerBooked } from './worker.booked'
import { workerGuest } from './worker.guest'
import { workerOwner } from './worker.owner'
import { workerQuoted } from './worker.quoted'
import { workerVisitor } from './worker.visitor'

export { getPublicProfileView } from './getPublicProfileView'
export type {
  PublicProfileContactAction,
  PublicProfileContactHelper,
  PublicProfilePageConfig,
  PublicProfileSection,
  PublicProfileStat,
  PublicProfileStatusConfig,
  PublicProfileViewConfig,
  PublicProfileViewInput,
  PublicProfileViewName,
} from './types'

export const PUBLIC_PROFILE_VIEWS: Record<
  PublicProfileViewName,
  PublicProfileViewConfig
> = {
  loading,
  loadError,
  unavailable,
  'worker.guest': workerGuest,
  'worker.visitor': workerVisitor,
  'worker.quoted': workerQuoted,
  'worker.booked': workerBooked,
  'worker.owner': workerOwner,
  'worker.ownerHidden': workerOwnerHidden,
  'customer.visitor': customerVisitor,
  'customer.owner': customerOwner,
  'customer.ownerHidden': customerOwnerHidden,
}
