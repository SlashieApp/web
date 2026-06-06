'use client'

import { useMutation } from '@apollo/client/react'
import type { ResendVerificationEmailMutation } from '@codegen/schema'
import { useCallback, useState } from 'react'

import { isResendVerificationRateLimitedError } from '@/app/(auth)/helpers/emailVerification'
import ResendVerificationEmail from '@/app/(auth)/verify-email/graphql/ResendVerificationEmail.gql'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'

type ResendState = 'idle' | 'sending' | 'sent' | 'error'

export function useResendVerificationEmail() {
  const [state, setState] = useState<ResendState>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const [resendMutation] = useMutation<ResendVerificationEmailMutation>(
    ResendVerificationEmail,
  )

  const resend = useCallback(async () => {
    setState('sending')
    setMessage(null)
    try {
      const result = await resendMutation()
      if (!result.data?.resendVerificationEmail) {
        throw new Error('Could not send verification email.')
      }
      setState('sent')
      setMessage('Verification email sent. Check your inbox.')
      return true
    } catch (error: unknown) {
      setState('error')
      if (isResendVerificationRateLimitedError(error)) {
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
  }, [])

  return {
    resend,
    reset,
    state,
    message,
    isSending: state === 'sending',
    isSent: state === 'sent',
  }
}
