import { TaskContactMethod } from '@codegen/schema'

import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import { isPhoneVerified } from '@/app/(auth)/helpers/phoneVerification'
import type { MeSnapshot } from '@/app/(auth)/store/user'

export type ContactOption = {
  value: TaskContactMethod
  label: string
  enabled: boolean
  /** Helper shown when the option is disabled (not yet verified). */
  disabledHint?: string
}

/**
 * Default-contact dropdown options. In-app is always available; email and phone
 * unlock only once the matching contact method is verified.
 */
export function getContactOptions(me: MeSnapshot): ContactOption[] {
  return [
    {
      value: TaskContactMethod.InApp,
      label: 'In-app chat',
      enabled: true,
    },
    {
      value: TaskContactMethod.Email,
      label: 'Email',
      enabled: isEmailVerified(me),
      disabledHint: 'Verify your email in Account to use this option.',
    },
    {
      value: TaskContactMethod.Phone,
      label: 'Phone',
      enabled: isPhoneVerified(me),
      disabledHint: 'Verify your phone in Account to use this option.',
    },
  ]
}
