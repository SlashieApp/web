'use client'

import { Box, Stack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import authBag from '@/app/(auth)/components/i11n.json'
import { AuthAlert } from '@/app/(auth)/components/ui/AuthAlert'
import { AuthCard } from '@/app/(auth)/components/ui/AuthCard'
import { EmailInput } from '@/app/(auth)/components/ui/AuthFields'
import { TurnstileField } from '@/app/(auth)/components/ui/TurnstileField'
import {
  readResetEmail,
  stashResetEmail,
} from '@/app/(auth)/helpers/resetEmailHandoff'
import { useForgotPassword } from '@/app/(auth)/helpers/useForgotPassword'
import { useProgressiveCaptcha } from '@/app/(auth)/helpers/useProgressiveCaptcha'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Button, FormField, Link } from '@ui'

import bag from '../../i11n.json'
import { useForgotPasswordMessage } from './forgotPasswordMessage'

/** /forgot-password: the email to send a reset link to, behind the security check. */
export function ForgotPasswordForm() {
  const t = useI11n(bag)
  const shared = useI11n(authBag)
  const router = useRouter()
  const [email, setEmail] = useState('')

  // Prefill from login (sessionStorage, never the URL).
  useEffect(() => {
    const saved = readResetEmail()
    if (saved) setEmail((current) => current || saved)
  }, [])
  const captcha = useProgressiveCaptcha({ alwaysRequire: true })

  const { requestReset, loading, message, cooldownSeconds, canResend } =
    useForgotPassword()
  const alert = useForgotPasswordMessage(message)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (captcha.requiresCaptcha && !captcha.token) return

    const result = await requestReset(email, { captchaToken: captcha.token })
    if (!result || result.rateLimited) {
      captcha.resetChallenge()
      return
    }

    stashResetEmail(email)
    router.push('/forgot-password/sent')
  }

  const submitDisabled =
    !canResend || !email.trim() || (captcha.requiresCaptcha && !captcha.token)

  return (
    <AuthCard
      title={t.title}
      description={t.description}
      footer={
        <Link href="/login" fontWeight={700} color="text.link">
          {shared.backToLogin}
        </Link>
      }
    >
      <Box asChild w="full">
        <form method="post" onSubmit={onSubmit}>
          <Stack gap={4}>
            <FormField label={t.emailLabel}>
              <EmailInput
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                autoComplete="email"
                required
              />
            </FormField>

            {captcha.requiresCaptcha ? (
              <TurnstileField
                onTokenChange={captcha.setToken}
                resetSignal={captcha.resetSignal}
              />
            ) : null}

            {alert ? (
              <AuthAlert tone={alert.tone}>{alert.text}</AuthAlert>
            ) : null}

            <Button
              type="submit"
              loading={loading}
              disabled={submitDisabled}
              w="full"
              size="lg"
              minH="48px"
            >
              {cooldownSeconds > 0
                ? formatMessage(shared.tryAgainIn, { seconds: cooldownSeconds })
                : t.submit}
            </Button>
          </Stack>
        </form>
      </Box>
    </AuthCard>
  )
}
