'use client'

import { Stack, Text } from '@chakra-ui/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useRef } from 'react'
import { LuMailCheck } from 'react-icons/lu'

import authBag from '@/app/(auth)/components/i11n.json'
import { AuthAlert } from '@/app/(auth)/components/ui/AuthAlert'
import { AuthCard } from '@/app/(auth)/components/ui/AuthCard'
import { SessionLoading } from '@/app/(auth)/components/ui/SessionLoading'
import { getSafeNextPath } from '@/app/(auth)/helpers/authRedirect'
import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import { useResendVerificationEmail } from '@/app/(auth)/helpers/useResendVerificationEmail'
import { useMe } from '@/app/(auth)/store/user'
import { useI11n } from '@/i18n/useI11n'
import { APP_HOME } from '@/utils/appRoutes'
import { getAuthToken } from '@/utils/auth'
import { Button, Link } from '@ui'

import bag from '../sent/i11n.json'

const LOGIN_HREF = `/login?next=${encodeURIComponent('/verify-email/sent')}`

/** /verify-email/sent: check your inbox; carry on now or resend the link. */
export function VerifyEmailSentScreen() {
  const t = useI11n(bag)
  const shared = useI11n(authBag)
  const router = useRouter()
  const me = useMe()
  const resend = useResendVerificationEmail()
  const nextPath = getSafeNextPath(useSearchParams().get('next')) ?? APP_HOME
  const verified = Boolean(me && isEmailVerified(me))

  const redirectedRef = useRef(false)
  const onMountRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || redirectedRef.current || !verified) return
      redirectedRef.current = true
      router.replace(nextPath)
    },
    [nextPath, router, verified],
  )

  if (verified) {
    return (
      <div ref={onMountRef}>
        <SessionLoading />
      </div>
    )
  }

  const signedIn = Boolean(getAuthToken())

  return (
    <AuthCard
      icon={LuMailCheck}
      title={t.title}
      description={
        <>
          {t.descriptionPrefix}{' '}
          {me?.email ? (
            <Text as="span" fontWeight={700} color="text.default">
              {me.email}
            </Text>
          ) : (
            t.descriptionFallbackEmail
          )}
          . {t.descriptionSuffix}
        </>
      }
    >
      {signedIn ? (
        <Stack gap={3}>
          {resend.isSent ? (
            <AuthAlert tone="success">{shared.resend.sent}</AuthAlert>
          ) : resend.failure ? (
            <AuthAlert>{shared.resend[resend.failure]}</AuthAlert>
          ) : null}
          {/* Verifying can wait; carrying on (e.g. into worker setup) is the next step. */}
          <Button asChild w="full" size="lg" minH="48px">
            <Link href={nextPath} _hover={{ textDecoration: 'none' }}>
              {t.continue}
            </Link>
          </Button>
          <Button
            variant="secondary"
            w="full"
            size="lg"
            minH="48px"
            loading={resend.isSending}
            onClick={() => void resend.resend()}
          >
            {t.resend}
          </Button>
        </Stack>
      ) : (
        <Stack gap={3}>
          <Text fontSize="sm" color="text.muted" textAlign="center">
            {t.loginPrompt}
          </Text>
          <Button asChild w="full" size="lg" minH="48px">
            <Link href={LOGIN_HREF} _hover={{ textDecoration: 'none' }}>
              {t.login}
            </Link>
          </Button>
        </Stack>
      )}
    </AuthCard>
  )
}
