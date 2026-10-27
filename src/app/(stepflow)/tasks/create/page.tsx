'use client'

import { useQuery } from '@apollo/client/react'
import { type MeQuery, TaskContactMethod } from '@codegen/schema'
import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

import { SessionLoading } from '@/app/(auth)/components/ui/SessionLoading'
import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import { getContactOptions } from '@/app/(dashboard)/profile/profileEligibility'
import { StatusScreen } from '@/app/StatusScreen'
import Me from '@/graphql/Me.gql'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { stripLocalePrefix } from '@/i18n/navigation'
import { useI11n } from '@/i18n/useI11n'
import { APP_HOME } from '@/utils/appRoutes'
import { getAuthToken } from '@/utils/auth'
import { Button, Link } from '@ui'

import { CreateTaskScreen } from './components/CreateTaskScreen'
import { CreateTaskVerifyEmailGate } from './components/layout/shared/CreateTaskVerifyEmailGate'
import bag from './i11n.json'
import { CREATE_TASK_VIEWS, getCreateTaskView } from './views'

/** Where login sends the poster back to, query included (repost, /search centre). */
function returnPath(): string {
  const bare = stripLocalePrefix(window.location.pathname)
  return `${bare && bare !== '/' ? bare : '/tasks/create'}${window.location.search}`
}

/** /tasks/create: signed-in only; the flow itself is CreateTaskScreen. */
export default function CreateTaskPage() {
  const t = useI11n(bag)
  const router = useRouter()
  const localize = useLocalizedHref()
  const [session, setSession] = useState<'guest' | 'ready' | null>(null)
  const gateRef = useRef(false)
  // Browser only: the server has no session or `window`, so it renders the
  // loading state and the gate runs on the client (FE-323).
  if (!gateRef.current && typeof window !== 'undefined') {
    gateRef.current = true
    const signedIn = Boolean(getAuthToken())
    setSession(signedIn ? 'ready' : 'guest')
    if (!signedIn) {
      router.replace(
        localize(`/login?next=${encodeURIComponent(returnPath())}`),
      )
    }
  }

  const { data, loading, error, refetch } = useQuery<MeQuery>(Me, {
    skip: session !== 'ready',
    fetchPolicy: 'cache-first',
  })
  const me = data?.me

  // Verified in another tab? Re-read the account when the email check shows.
  const recheckEmail = useCallback(() => {
    void refetch().catch(() => null)
  }, [refetch])

  const config =
    CREATE_TASK_VIEWS[
      getCreateTaskView({
        session:
          session === 'guest'
            ? 'guest'
            : session === null || (!me && loading)
              ? 'loading'
              : !me && error
                ? 'error'
                : me && !isEmailVerified(me)
                  ? 'unverified'
                  : 'ready',
        step: 'location',
      })
    ]

  if (config.layout === 'error') {
    return (
      <StatusScreen
        title={t.loadErrorTitle}
        body={t.loadErrorBody}
        actions={
          <>
            <Button variant="primary" onClick={() => void refetch()}>
              {t.retry}
            </Button>
            <Button asChild variant="ghost">
              <Link href={APP_HOME}>{t.backToSearch}</Link>
            </Button>
          </>
        }
      />
    )
  }
  if (config.layout === 'verifyEmail' && me) {
    return (
      <CreateTaskVerifyEmailGate
        email={me.email ?? ''}
        verifyHref={`/verify-email/sent?next=${encodeURIComponent(returnPath())}`}
        onShown={recheckEmail}
      />
    )
  }
  if (config.layout !== 'step' || !me) return <SessionLoading minH="50vh" />

  return (
    <CreateTaskScreen
      userId={me.id}
      emailVerified={isEmailVerified(me)}
      preferredContactDefault={
        me.profile?.defaultPreferredContactMethod ?? TaskContactMethod.InApp
      }
      contactOptions={getContactOptions(me)}
    />
  )
}
