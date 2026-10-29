'use client'

import { useMutation } from '@apollo/client/react'
import type { VerifyEmailMutation } from '@codegen/schema'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'
import {
  LuCircleCheck,
  LuLink2Off,
  LuMailOpen,
  LuTriangleAlert,
} from 'react-icons/lu'

import authBag from '@/app/(auth)/components/i11n.json'
import { AuthAlert } from '@/app/(auth)/components/ui/AuthAlert'
import { AuthCard } from '@/app/(auth)/components/ui/AuthCard'
import { getSafeNextPath } from '@/app/(auth)/helpers/authRedirect'
import { useResendVerificationEmail } from '@/app/(auth)/helpers/useResendVerificationEmail'
import { useUserStore } from '@/app/(auth)/store/user'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { EVENTS, trackFlowFailed, trackFlowSucceeded } from '@/utils/analytics'
import { APP_HOME } from '@/utils/appRoutes'
import { showAppToast } from '@/utils/appToast'
import { getAuthToken, setAuthToken } from '@/utils/auth'
import { getGraphQLErrorCode } from '@/utils/graphqlErrors'
import { Button, FormStack, Link } from '@ui'

import VerifyEmail from '../graphql/VerifyEmail.gql'
import bag from '../i11n.json'

type VerifyState = 'verifying' | 'verified' | 'invalidLink' | 'failed'
type VerifyFailure = 'expired' | 'emailMismatch' | 'emailInUse' | 'failed'

function verifyFailureFor(error: unknown): VerifyFailure {
  const code = getGraphQLErrorCode(error)
  if (code === 'INVALID_OR_EXPIRED_VERIFICATION') return 'expired'
  if (code === 'EMAIL_MISMATCH') return 'emailMismatch'
  if (code === 'EMAIL_OR_PHONE_IN_USE') return 'emailInUse'
  return 'failed'
}

const RESEND_LOGIN_HREF = `/login?next=${encodeURIComponent('/verify-email/sent')}`

/** /verify-email: confirms the emailed link, then carries on to `next`. */
export function VerifyEmailScreen() {
  const t = useI11n(bag)
  const shared = useI11n(authBag)
  const router = useRouter()
  const searchParams = useSearchParams()
  const getUser = useUserStore((s) => s.getUser)
  const token = searchParams.get('token')?.trim() ?? ''
  const nextPath = getSafeNextPath(searchParams.get('next')) ?? APP_HOME
  const [state, setState] = useState<VerifyState>(
    token ? 'verifying' : 'invalidLink',
  )
  const [failure, setFailure] = useState<VerifyFailure>('failed')
  const startedRef = useRef(false)
  const [verifyEmail] = useMutation<VerifyEmailMutation>(VerifyEmail)
  const resend = useResendVerificationEmail()

  const runVerify = useCallback(async () => {
    // A link for a pending address completes an email change (BE-71).
    const previous = useUserStore.getState().me
    try {
      const result = await verifyEmail({ variables: { token } })
      const authToken = result.data?.verifyEmail?.token?.trim()
      if (!authToken) {
        throw new Error(
          'Verification succeeded but no session token was returned.',
        )
      }
      setAuthToken(authToken)
      await getUser()
      const verified = result.data?.verifyEmail?.user
      const changed = Boolean(
        previous &&
          verified?.id === previous.id &&
          verified?.email !== previous.email,
      )
      if (changed) {
        showAppToast({
          title: t.changedTitle,
          description: formatMessage(t.changedDescription, {
            email: verified?.email ?? '',
          }),
          type: 'success',
        })
      }
      trackFlowSucceeded(EVENTS.email_verify_success, { change: changed })
      setState('verified')
      router.replace(nextPath)
    } catch (error: unknown) {
      trackFlowFailed(EVENTS.email_verify_fail, error, {
        flow: 'email_verify',
        action: 'verifyEmail',
        operation: 'VerifyEmail',
        route: '/verify-email',
      })
      setFailure(verifyFailureFor(error))
      setState('failed')
    }
  }, [getUser, nextPath, router, t, token, verifyEmail])

  const onMountRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || startedRef.current || !token) return
      startedRef.current = true
      void runVerify()
    },
    [runVerify, token],
  )

  const signedIn = Boolean(getAuthToken())
  const resendAction = signedIn ? (
    <Button
      w="full"
      size="form"
      loading={resend.isSending}
      onClick={() => void resend.resend()}
    >
      {t.resend}
    </Button>
  ) : (
    <Button asChild w="full" size="form">
      <Link href={RESEND_LOGIN_HREF} _hover={{ textDecoration: 'none' }}>
        {t.loginToResend}
      </Link>
    </Button>
  )
  const resendAlert = resend.isSent ? (
    <AuthAlert tone="success">{shared.resend.sent}</AuthAlert>
  ) : resend.failure ? (
    <AuthAlert>{shared.resend[resend.failure]}</AuthAlert>
  ) : null

  return (
    <div ref={onMountRef}>
      {state === 'verifying' ? (
        <AuthCard
          icon={LuMailOpen}
          title={t.loadingTitle}
          description={t.loadingDescription}
        />
      ) : state === 'verified' ? (
        <AuthCard
          icon={LuCircleCheck}
          tone="success"
          title={t.successTitle}
          description={t.successDescription}
        />
      ) : state === 'invalidLink' ? (
        <AuthCard
          icon={LuLink2Off}
          tone="warning"
          title={t.invalidTitle}
          description={t.invalidDescription}
        >
          {/* Form spacing (FE-481): 24 under the header, the alert, then 20 to the button. */}
          <FormStack>
            {resendAlert}
            {resendAction}
          </FormStack>
        </AuthCard>
      ) : (
        <AuthCard
          icon={LuTriangleAlert}
          tone="danger"
          title={t.errorTitle}
          description={
            failure === 'expired' ? t.errorDescription : t.messages[failure]
          }
        >
          {/* Form spacing (FE-481): 24 under the header, the alert, then 20 to the button. */}
          <FormStack>
            {resendAlert}
            {resendAction}
          </FormStack>
        </AuthCard>
      )}
    </div>
  )
}
