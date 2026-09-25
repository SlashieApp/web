'use client'

import { useCallback, useRef } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import RegisterWebPushSubscription from '@/app/(dashboard)/account/graphql/RegisterWebPushSubscription.graphql'
import {
  pushSubscriptionKeys,
  readWebPushSubscription,
  webPushSupported,
} from '@/content/notifications/webPush'
import { getAuthToken } from '@/utils/auth'
import { useMutation } from '@apollo/client/react'

/**
 * Re-registers an existing granted subscription after sign-in.
 * Does not call `Notification.requestPermission`.
 */
export function WebPushSync() {
  const me = useUserStore((s) => s.me)
  const syncedRef = useRef(false)
  const [register] = useMutation(RegisterWebPushSubscription)

  const onRef = useCallback(
    (node: HTMLSpanElement | null) => {
      if (!node || syncedRef.current || !me || !getAuthToken()) return
      if (!webPushSupported() || Notification.permission !== 'granted') return
      syncedRef.current = true
      void (async () => {
        const subscription = await readWebPushSubscription()
        if (!subscription) return
        const keys = pushSubscriptionKeys(subscription)
        if (!keys) return
        try {
          await register({ variables: keys })
        } catch {
          syncedRef.current = false
        }
      })()
    },
    [me, register],
  )

  if (!me) return null
  return <span hidden ref={onRef} />
}
