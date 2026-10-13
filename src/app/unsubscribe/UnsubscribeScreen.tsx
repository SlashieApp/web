'use client'

import { useMutation } from '@apollo/client/react'
import type { UnsubscribeMarketingEmailsMutation } from '@codegen/schema'
import { useCallback, useRef, useState } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import { useI11n } from '@/i18n/useI11n'
import { getAuthToken } from '@/utils/auth'
import { getGraphQLErrorCode } from '@/utils/graphqlErrors'
import { Button, Link } from '@ui'

import { StatusScreen } from '../StatusScreen'
import UnsubscribeMarketingEmails from './graphql/UnsubscribeMarketingEmails.gql'
import bag from './i11n.json'

type UnsubscribeState = 'loading' | 'done' | 'invalid' | 'error'

/**
 * Marketing email unsubscribe (FE-214, BE-76). Runs once on open, no confirm
 * step. The token is never logged or sent to analytics.
 */
export function UnsubscribeScreen({ token }: { token: string | null }) {
  const t = useI11n(bag)
  const getUser = useUserStore((s) => s.getUser)
  const [state, setState] = useState<UnsubscribeState>(
    token ? 'loading' : 'invalid',
  )
  const [unsubscribe] = useMutation<UnsubscribeMarketingEmailsMutation>(
    UnsubscribeMarketingEmails,
  )

  const run = useCallback(() => {
    if (!token) return
    setState('loading')
    unsubscribe({ variables: { token } })
      .then((res) => {
        setState(res.data?.unsubscribeMarketingEmails ? 'done' : 'invalid')
        // Signed in: refresh me so the Account toggle shows off.
        if (getAuthToken()) void getUser()
      })
      .catch((err: unknown) => {
        setState(
          getGraphQLErrorCode(err) === 'INVALID_UNSUBSCRIBE_TOKEN'
            ? 'invalid'
            : 'error',
        )
      })
  }, [getUser, token, unsubscribe])

  // Once per page load (a ref, so a strict-mode double mount can't repeat it).
  const ranRef = useRef(false)
  const onMountRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || ranRef.current) return
      ranRef.current = true
      run()
    },
    [run],
  )

  const accountLink = (label: string) => (
    <Button asChild variant="secondary">
      <Link href="/account" _hover={{ textDecoration: 'none' }}>
        {label}
      </Link>
    </Button>
  )

  return (
    <div ref={onMountRef}>
      {state === 'loading' ? (
        <StatusScreen
          title={t.loadingTitle}
          body={t.loadingBody}
          actions={null}
        />
      ) : state === 'done' ? (
        <StatusScreen
          title={t.doneTitle}
          body={t.doneBody}
          actions={accountLink(t.doneLink)}
        />
      ) : state === 'error' ? (
        <StatusScreen
          title={t.errorTitle}
          body={t.errorBody}
          actions={
            <Button variant="primary" onClick={run}>
              {t.retry}
            </Button>
          }
        />
      ) : (
        <StatusScreen
          title={t.invalidTitle}
          body={t.invalidBody}
          actions={accountLink(t.accountLink)}
        />
      )}
    </div>
  )
}
