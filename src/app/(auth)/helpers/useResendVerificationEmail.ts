'use client'

import { useMutation } from '@apollo/client/react'
import type { ResendVerificationEmailMutation } from '@codegen/schema'
import { useCallback, useState } from 'react'

import { isResendVerificationRateLimitedError } from '@/app/(auth)/helpers/emailVerification'
import ResendVerificationEmail from '@/app/(auth)/verify-email/graphql/ResendVerificationEmail.gql'
import { EVENTS, trackFlowFailed, trackFlowSucceeded } from '@/utils/analytics'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'

type ResendState = 'idle' | 'sending' | 'sent' | 'error'

/** Why a resend failed, for pages that word it themselves (auth pages). */
export type ResendFailure = 'tooSoon' | 'failed'

export function useResendVerificationEmail() {
  const [state, setState] = useState<ResendState>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [failure, setFailure] = useState<ResendFailure | null>(null)

  const [resendMutation] = useMutation<ResendVerificationEmailMutation>(
    ResendVerificationEmail,
  )

  const resend = useCallback(async () => {
    setState('sending')
    setMessage(null)
    setFailure(null)
    try {
      const result = await resendMutation()
      if (!result.data?.resendVerificationEmail) {
        throw new Error('Could not send verification email.')
      }
      trackFlowSucceeded(EVENTS.email_resend_success)
      setState('sent')
      setMessage('Verification email sent. Check your inbox.')
      return true
    } catch (error: unknown) {
      trackFlowFailed(EVENTS.email_resend_fail, error, {
        flow: 'email_verify',
        action: 'resendVerificationEmail',
        operation: 'ResendVerificationEmail',
      })
      setState('error')
      const tooSoon = isResendVerificationRateLimitedError(error)
      setFailure(tooSoon ? 'tooSoon' : 'failed')
      if (tooSoon) {
        setMessage(
          getFriendlyErrorMessage(
            error,
            'Please wait 2 minutes before resending.',
          ),
        )
      } else {
        setMessage(
          getFriendlyErrorMessage(
            error,
            'Could not send verification email. Try again shortly.',
          ),
        )
      }
      return false
    }
  }, [resendMutation])

  const reset = useCallback(() => {
    setState('idle')
    setMessage(null)
    setFailure(null)
  }, [])

  return {
    resend,
    reset,
    state,
    message,
    failure,
    isSending: state === 'sending',
    isSent: state === 'sent',
  }
}
