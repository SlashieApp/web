import {
  canChangeEmail,
  isEmailVerified,
  pendingEmailChange,
} from '@/app/(auth)/helpers/emailVerification'
import {
  isPhoneVerified,
  pendingPhoneChange,
  profileContactNumber,
} from '@/app/(auth)/helpers/phoneVerification'
import type { MeSnapshot } from '@/app/(auth)/store/user'

/** What the email or phone row shows (README in account/views). */
export type ContactRowView =
  | 'emailVerified'
  | 'emailLocked'
  | 'emailUnverified'
  | 'emailPending'
  | 'phoneMissing'
  | 'phoneUnverified'
  | 'phoneVerified'
  | 'phonePending'

export type ContactRowAction =
  | 'verifyEmail'
  | 'changeEmail'
  | 'addPhone'
  | 'verifyPhone'
  | 'changePhone'

export type ContactRowConfig = {
  channel: 'email' | 'phone'
  badge: 'verified' | 'notVerified' | null
  /** The row's one action; a pending change brings its own buttons. */
  action: ContactRowAction | null
  /** A new value waits for its link or code; the old one stays live. */
  pending: boolean
  /** Google / Apple accounts keep the provider's email. */
  locked: boolean
}

const row = (
  channel: ContactRowConfig['channel'],
  badge: ContactRowConfig['badge'],
  action: ContactRowAction | null,
  extra: Partial<Pick<ContactRowConfig, 'pending' | 'locked'>> = {},
): ContactRowConfig => ({
  channel,
  badge,
  action,
  pending: false,
  locked: false,
  ...extra,
})

export const CONTACT_ROW_VIEWS: Record<ContactRowView, ContactRowConfig> = {
  emailVerified: row('email', 'verified', 'changeEmail'),
  emailLocked: row('email', 'verified', null, { locked: true }),
  emailUnverified: row('email', 'notVerified', 'verifyEmail'),
  emailPending: row('email', null, null, { pending: true }),
  phoneMissing: row('phone', null, 'addPhone'),
  phoneUnverified: row('phone', 'notVerified', 'verifyPhone'),
  phoneVerified: row('phone', 'verified', 'changePhone'),
  phonePending: row('phone', null, null, { pending: true }),
}

export function getEmailRowView(me: MeSnapshot): ContactRowView {
  if (pendingEmailChange(me)) return 'emailPending'
  if (!isEmailVerified(me)) return 'emailUnverified'
  return canChangeEmail(me) ? 'emailVerified' : 'emailLocked'
}

export function getPhoneRowView(me: MeSnapshot): ContactRowView {
  if (pendingPhoneChange(me)) return 'phonePending'
  if (!profileContactNumber(me)) return 'phoneMissing'
  return isPhoneVerified(me) ? 'phoneVerified' : 'phoneUnverified'
}
