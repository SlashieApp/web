'use client'

import { useMutation, useQuery } from '@apollo/client/react'
import { useCallback, useState } from 'react'
import { flushSync } from 'react-dom'

import RegisterWebPushSubscription from '@/app/(dashboard)/account/graphql/RegisterWebPushSubscription.graphql'
import UnregisterWebPushSubscription from '@/app/(dashboard)/account/graphql/UnregisterWebPushSubscription.graphql'
import WebPushVapidPublicKey from '@/app/(dashboard)/account/graphql/WebPushVapidPublicKey.graphql'
import {
  pushSubscriptionKeys,
  readWebPushSubscription,
  subscribeWebPush,
  unsubscribeWebPush,
  webPushSupported,
} from '@/content/notifications/webPush'
import { useI11n } from '@/i18n/useI11n'
import { isGraphQLSchemaMismatch } from '@/utils/graphqlSchemaMismatch'

import { SettingToggle } from '../../components/ui/SettingToggle'
import bag from '../i11n.json'

type VapidQuery = {
  webPushVapidPublicKey?: string | null
}

/**
 * Permission is requested only from this toggle. The call starts synchronously
 * in the click handler so the browser still treats it as a user gesture.
 */
export function WebPushControl({
  disabled = false,
}: {
  /** Off while suspended: the API refuses changes. */
  disabled?: boolean
}) {
  const t = useI11n(bag)
  const [checked, setChecked] = useState(false)
  const [known, setKnown] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const vapid = useQuery<VapidQuery>(WebPushVapidPublicKey, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-first',
  })
  const [register] = useMutation(RegisterWebPushSubscription)
  const [unregister] = useMutation(UnregisterWebPushSubscription)

  const onMount = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || known) return
      if (!webPushSupported() || Notification.permission !== 'granted') {
        setKnown(true)
        return
      }
      void readWebPushSubscription().then((subscription) => {
        setChecked(Boolean(subscription))
        setKnown(true)
      })
    },
    [known],
  )

  const publicKey = vapid.data?.webPushVapidPublicKey?.trim() || null
  const unavailable = !webPushSupported()
    ? t.webPushUnsupported
    : !vapid.loading && (!publicKey || isGraphQLSchemaMismatch(vapid.error))
      ? t.webPushUnavailable
      : undefined

  const onChange = (next: boolean) => {
    if (pending || unavailable) return
    setError(null)
    if (!next) {
      setPending(true)
      flushSync(() => setChecked(false))
      void (async () => {
        try {
          const endpoint = await unsubscribeWebPush()
          if (endpoint) {
            await unregister({ variables: { endpoint } })
          }
        } catch {
          setChecked(true)
          setError(t.webPushError)
        } finally {
          setPending(false)
        }
      })()
      return
    }
    if (!publicKey || typeof Notification === 'undefined') return
    const permissionPromise = Notification.requestPermission()
    // Optimistic, then reverted on refusal. flushSync renders the optimistic
    // value first: batched with a quick revert it would be no change at all,
    // and the switch's checkbox would keep the browser's toggled state.
    flushSync(() => setChecked(true))
    setPending(true)
    void (async () => {
      try {
        const permission = await permissionPromise
        const subscription = await subscribeWebPush(publicKey, permission)
        const keys = subscription ? pushSubscriptionKeys(subscription) : null
        if (!keys) {
          setChecked(false)
          setError(permission === 'denied' ? t.webPushDenied : t.webPushError)
          return
        }
        await register({ variables: keys })
        setChecked(true)
      } catch {
        setChecked(false)
        setError(t.webPushError)
      } finally {
        setPending(false)
      }
    })()
  }

  return (
    <div ref={onMount}>
      <SettingToggle
        label={t.webPush}
        description={unavailable ?? error ?? t.webPushDescription}
        checked={checked}
        disabled={
          disabled || pending || vapid.loading || !known || Boolean(unavailable)
        }
        onChange={onChange}
      />
    </div>
  )
}
