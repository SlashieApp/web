import { customer } from './customer'
import { customerHidden } from './customerHidden'
import type { ProfileView, ProfileViewConfig } from './types'
import { workerHidden } from './workerHidden'
import { workerReady } from './workerReady'
import { workerSetup } from './workerSetup'
import { workerVerifyPhone } from './workerVerifyPhone'

export { getProfileView } from './getProfileView'
export type {
  ProfileBadge,
  ProfileView,
  ProfileViewConfig,
  ProfileViewInput,
} from './types'

export const PROFILE_VIEWS: Record<ProfileView, ProfileViewConfig> = {
  customer,
  customerHidden,
  workerSetup,
  workerHidden,
  workerVerifyPhone,
  workerReady,
}
