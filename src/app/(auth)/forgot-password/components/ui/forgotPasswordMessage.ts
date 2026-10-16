'use client'

import authBag from '@/app/(auth)/components/i11n.json'
import type { ForgotPasswordMessage } from '@/app/(auth)/helpers/useForgotPassword'
import { useI11n } from '@/i18n/useI11n'

import bag from '../../i11n.json'

/** Copy and tone for a reset-link request's outcome; `sent` is the only success. */
export function useForgotPasswordMessage(
  message: ForgotPasswordMessage | null,
) {
  const t = useI11n(bag).messages
  const shared = useI11n(authBag).messages
  if (!message) return null
  const text =
    message === 'sent' || message === 'tooSoon' || message === 'failed'
      ? t[message]
      : shared[message]
  return { text, tone: message === 'sent' ? 'success' : 'danger' } as const
}
