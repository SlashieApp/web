'use client'

import { Box, HStack } from '@chakra-ui/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

import { SessionLoading } from '@/app/(auth)/components/ui/SessionLoading'
import { useLoginAutofill } from '@/app/(auth)/helpers/LoginAutofillProvider'
import { deletionNoticeFromParams } from '@/app/(auth)/helpers/accountDeletion'
import { parseAuthAbuseError } from '@/app/(auth)/helpers/authAbuseErrors'
import {
  clearLoginFailCount,
  getLoginFailCount,
  incrementLoginFailCount,
} from '@/app/(auth)/helpers/authFailCount'
import {
  authSwitchHref,
  getSafeNextPath,
} from '@/app/(auth)/helpers/authRedirect'
import { useCooldownSeconds } from '@/app/(auth)/helpers/useCooldownSeconds'
import { useProgressiveCaptcha } from '@/app/(auth)/helpers/useProgressiveCaptcha'
import { useUserStore } from '@/app/(auth)/store/user'
import { APP_HOME } from '@/utils/appRoutes'

import type { LoginFormValues } from '../loginFormSchema'
import {
  LOGIN_VIEWS,
  type LoginMessage,
  getLoginView,
  loginMessageFor,
} from '../views'
import { LoginAside } from './LoginAside'
import { LoginPanel } from './LoginPanel'

/**
 * /login: checks a saved session first (and leaves for `next` when it's
 * valid), otherwise shows the brand panel and the sign-in column for the
 * current view.
 */
export function LoginScreen({ hasSession }: { hasSession: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = getSafeNextPath(searchParams.get('next'))
  const autofill = useLoginAutofill()
  const login = useUserStore((s) => s.login)
  const getUser = useUserStore((s) => s.getUser)
  const loading = useUserStore((s) => s.isLoading)
  const [session, setSession] = useState<'checking' | 'signedOut'>(
    hasSession ? 'checking' : 'signedOut',
  )
  const [message, setMessage] = useState<LoginMessage | null>(null)
  const [leaving, setLeaving] = useState(false)
  const captcha = useProgressiveCaptcha({
    initialFailCount: getLoginFailCount(),
  })
  const { seconds: retryInSeconds, startCooldown } = useCooldownSeconds()

  const checkedRef = useRef(false)
  const onMountCheckSession = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || checkedRef.current || !hasSession) return
      checkedRef.current = true
      void getUser().then((user) => {
        if (user) router.replace(next ?? APP_HOME)
        else setSession('signedOut')
      })
    },
    [getUser, hasSession, next, router],
  )

  const view = getLoginView({
    session,
    retryInSeconds,
    securityCheckRequired: captcha.requiresCaptcha,
  })

  const onSubmit = async (values: LoginFormValues) => {
    setMessage(null)
    try {
      await login({
        ...values,
        captchaToken: captcha.token,
        analytics: {
          had_captcha: captcha.requiresCaptcha,
          fail_count_client: captcha.failCount,
        },
      })
      clearLoginFailCount()
      captcha.setFailCount(0)
      // Keep the button busy until the next page takes over.
      setLeaving(true)
      router.push(next ?? APP_HOME)
    } catch (error: unknown) {
      captcha.setFailCount(incrementLoginFailCount())
      const abuse = parseAuthAbuseError(error)
      if (abuse.captchaRequired) captcha.markApiRequiresCaptcha()
      else captcha.resetChallenge()
      if (abuse.retryAfterSeconds) startCooldown(abuse.retryAfterSeconds)
      setMessage(loginMessageFor(error))
    }
  }

  return (
    <Box ref={onMountCheckSession} w="full" flex={1} display="flex" minH={0}>
      {LOGIN_VIEWS[view].form ? (
        <HStack align="stretch" gap={{ base: 0, lg: 10 }} w="full" flex={1}>
          <LoginAside />
          <LoginPanel
            view={view}
            message={message}
            notice={deletionNoticeFromParams(searchParams)}
            retryInSeconds={retryInSeconds}
            submitting={loading || leaving}
            securitySolved={Boolean(captcha.token)}
            securityResetSignal={captcha.resetSignal}
            onSecurityToken={captcha.setToken}
            next={next}
            registerHref={authSwitchHref('/register', searchParams)}
            defaultValues={autofill}
            onSubmit={(values) => void onSubmit(values)}
          />
        </HStack>
      ) : (
        <SessionLoading />
      )}
    </Box>
  )
}
