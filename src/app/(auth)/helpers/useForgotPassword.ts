'use client'

import { useMutation } from '@apollo/client/react'
import type { ForgotPasswordMutation } from '@codegen/schema'
import { useCallback, useState } from 'react'

import ForgotPassword from '@/app/(auth)/forgot-password/graphql/ForgotPassword.gql'
import { EVENTS, trackFlowFailed, trackFlowSucceeded } from '@/utils/analytics'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'

import { useCooldownSeconds } from './useCooldownSeconds'

export const PASSWORD_RESET_COOLDOWN_SECONDS = 60

export type ForgotPasswordRequestResult = {
  emailed: boolean
  rateLimited: boolean
  cooldownSecondsRemaining: number
}

export function useForgotPassword() {
  const [forgotPasswordMutation, { loading }] =
    useMutation<ForgotPasswordMutation>(ForgotPassword)
  const {
    seconds: cooldownSeconds,
    startCooldown,
    isActive,
  } = useCooldownSeconds()
  const [message, setMessage] = useState<string | null>(null)

  const requestReset = useCallback(
    async (email: string): Promise<ForgotPasswordRequestResult | null> => {
      const trimmed = email.trim()
      if (!trimmed) return null

      setMessage(null)

      try {
        const res = await forgotPasswordMutation({
          variables: { email: trimmed },
        })
        const payload = res.data?.forgotPassword
        if (!payload?.success) {
          throw new Error('Could not start password reset. Please try again.')
        }

        const cooldown = payload.cooldownSecondsRemaining ?? 0

        trackFlowSucceeded(EVENTS.password_reset_request)

        if (cooldown > 0) {
          startCooldown(cooldown)
        }

        if (cooldown > 0 && cooldown < PASSWORD_RESET_COOLDOWN_SECONDS) {
          setMessage(
            `Please wait ${cooldown} seconds before requesting another reset link.`,
          )
          return {
            emailed: false,
            rateLimited: true,
            cooldownSecondsRemaining: cooldown,
          }
        }

        setMessage(
          'If an account exists for this email, we sent a password reset link.',
        )

        return {
          emailed: true,
          rateLimited: false,
          cooldownSecondsRemaining: cooldown,
        }
      } catch (error: unknown) {
        trackFlowFailed(EVENTS.password_reset_request_fail, error, {
          flow: 'password_reset',
          action: 'forgotPassword',
          operation: 'ForgotPassword',
          route: '/forgot-password',
        })
        setMessage(
          getFriendlyErrorMessage(
            error,
            'Could not start password reset process.',
          ),
        )
        return null
      }
    },
    [forgotPasswordMutation, startCooldown],
  )

  return {
    requestReset,
    loading,
    message,
    cooldownSeconds,
    isCooldownActive: isActive,
    canResend: !loading && !isActive,
  }
}
