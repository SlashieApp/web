'use client'

import { Box } from '@chakra-ui/react'
import { useCallback, useRef, useState } from 'react'

import { useMe, useUserStore } from '@/app/(auth)/store/user'
import { getAuthToken } from '@/utils/auth'

import type { PricingRecord } from '../helpers/getPricingForPage'
import type messages from '../i11n.json'
import { PRICING_VIEWS, getPricingView } from '../views'
import { PricingPlanCards } from './ui/plan/PricingPlanCards'
import { PricingErrorState } from './ui/state/PricingErrorState'

type PricingCopy = (typeof messages)['en']

/**
 * Works out who's looking (the server's session cookie, then the profile) and
 * renders that view. With a session, the buttons are placeholders until the
 * profile loads, so a worker never sees a customer's button first.
 */
export function PricingPlans({
  pricing,
  hasSession,
  copy,
}: {
  pricing: PricingRecord | null
  hasSession: boolean
  copy: Pick<PricingCopy, 'plans' | 'intervals' | 'unavailable'>
}) {
  const me = useMe()
  const getUser = useUserStore((s) => s.getUser)
  const [checked, setChecked] = useState(!hasSession)
  const startedRef = useRef(false)

  const onMount = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || startedRef.current) return
      startedRef.current = true
      if (!getAuthToken() || useUserStore.getState().me) {
        setChecked(true)
        return
      }
      void getUser().finally(() => setChecked(true))
    },
    [getUser],
  )

  const view = getPricingView({
    available: pricing !== null,
    session: me ? 'signedIn' : checked ? 'guest' : 'checking',
    worker: me?.worker
      ? {
          setupComplete: Boolean(me.worker.setupProgress?.isComplete),
          membership: me.worker.membership,
        }
      : null,
  })
  const config = PRICING_VIEWS[view]

  return (
    <>
      <Box ref={onMount} display="none" aria-hidden />
      {pricing && config.plans ? (
        <PricingPlanCards
          pricing={pricing}
          config={config}
          copy={copy.plans}
          intervals={copy.intervals}
        />
      ) : (
        <PricingErrorState copy={copy.unavailable} />
      )}
    </>
  )
}
