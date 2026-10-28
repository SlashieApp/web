'use client'

import { Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LuMailCheck } from 'react-icons/lu'

import authBag from '@/app/(auth)/components/i11n.json'
import { AuthAlert } from '@/app/(auth)/components/ui/AuthAlert'
import { AuthCard } from '@/app/(auth)/components/ui/AuthCard'
import { SessionLoading } from '@/app/(auth)/components/ui/SessionLoading'
import { TurnstileField } from '@/app/(auth)/components/ui/TurnstileField'
import { readResetEmail } from '@/app/(auth)/helpers/resetEmailHandoff'
import { useForgotPassword } from '@/app/(auth)/helpers/useForgotPassword'
import { useProgressiveCaptcha } from '@/app/(auth)/helpers/useProgressiveCaptcha'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Button, Link } from '@ui'

import bag from '../../sent/i11n.json'
import { useForgotPasswordMessage } from './forgotPasswordMessage'

/** /forgot-password/sent: check your inbox, with a resend behind the security check. */
export function ForgotPasswordSentPanel() {
  const t = useI11n(bag)
  const shared = useI11n(authBag)
  const router = useRouter()
  // null until read from sessionStorage after mount; '' means none saved.
  const [email, setEmail] = useState<string | null>(null)
  const captcha = useProgressiveCaptcha({ alwaysRequire: true })

  const { requestReset, loading, message, cooldownSeconds, canResend } =
    useForgotPassword()
  const alert = useForgotPasswordMessage(message)

  useEffect(() => {
    const saved = readResetEmail()
    setEmail(saved)
    // Opened directly (no email from the form): start over.
    if (!saved) router.replace('/forgot-password')
  }, [router])

  async function onResend() {
    if (!email) return
    if (captcha.requiresCaptcha && !captcha.token) return
    await requestReset(email, { captchaToken: captcha.token })
    captcha.resetChallenge()
  }

  if (!email) return <SessionLoading />

  return (
    <AuthCard
      icon={LuMailCheck}
      title={t.title}
      description={
        <>
          {t.descriptionPrefix}{' '}
          <Text as="span" fontWeight={500} color="text.default">
            {email}
          </Text>
          {t.descriptionSuffix}
        </>
      }
      footer={
        <Link href="/login" fontWeight={500} color="text.link">
          {shared.backToLogin}
        </Link>
      }
    >
      {captcha.requiresCaptcha ? (
        <TurnstileField
          onTokenChange={captcha.setToken}
          resetSignal={captcha.resetSignal}
        />
      ) : null}
      {alert ? <AuthAlert tone={alert.tone}>{alert.text}</AuthAlert> : null}
      <Button
        variant="secondary"
        loading={loading}
        disabled={!canResend || (captcha.requiresCaptcha && !captcha.token)}
        onClick={() => void onResend()}
        w="full"
        size="lg"
        minH="48px"
      >
        {cooldownSeconds > 0
          ? formatMessage(shared.tryAgainIn, { seconds: cooldownSeconds })
          : t.resend}
      </Button>
    </AuthCard>
  )
}
