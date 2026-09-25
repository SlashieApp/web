'use client'

import { useI11n } from '@/i18n/useI11n'
import headerBag from '@/ui/Header/i11n.json'
import { useMutation, useQuery } from '@apollo/client/react'
import type {
  MarkAllNotificationsReadMutation,
  MarkNotificationReadMutation,
  MyNotificationsQuery,
} from '@codegen/schema'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

import {
  getAccountDisabledFlag,
  subscribeAccountDisabled,
} from '@/app/(auth)/helpers/accountDisabled'
import { useUserStore } from '@/app/(auth)/store/user'
import { WebPushSync } from '@/app/(dashboard)/components/notifications/WebPushSync'
import DismissNotification from '@/app/(dashboard)/dashboard/graphql/DismissNotification.gql'
import DismissReviewPrompt from '@/app/(dashboard)/dashboard/graphql/DismissReviewPrompt.gql'
import MarkAllNotificationsRead from '@/app/(dashboard)/dashboard/graphql/MarkAllNotificationsRead.gql'
import MarkNotificationClosed from '@/app/(dashboard)/dashboard/graphql/MarkNotificationClosed.gql'
import MarkNotificationRead from '@/app/(dashboard)/dashboard/graphql/MarkNotificationRead.gql'
import MyNotifications from '@/app/(dashboard)/dashboard/graphql/MyNotifications.gql'
import { popupDismissKind } from '@/content/reviews/reviewModel'
import { showAppToast } from '@/utils/appToast'
import { getAuthToken } from '@/utils/auth'
import {
  countUnreadNotifications,
  notificationDisplayText,
  notificationToastPlan,
} from '@/utils/notifications'

export type AppNotification = NonNullable<
  NonNullable<MyNotificationsQuery['me']>['notifications']
>['items'][number]

const POLL_MS = 45_000
const PAGE_SIZE = 30

type NotificationsContextValue = {
  items: AppNotification[]
  unreadCount: number
  loading: boolean
  /** Close (isClosed) is on the notifications query. */
  canClose: boolean
  drawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  refetch: () => Promise<void>
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  closeNotification: (id: string) => Promise<void>
  dismissPopup: (item: AppNotification) => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
)

export function NotificationsProvider({
  children,
}: { children: React.ReactNode }) {
  const me = useUserStore((s) => s.me)
  const notices = useI11n(headerBag).notifications
  const accountDisabled = useSyncExternalStore(
    subscribeAccountDisabled,
    getAccountDisabledFlag,
    () => false,
  )
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [hiddenIds, setHiddenIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  )
  const toastedIdsRef = useRef<Set<string>>(new Set())
  const bootstrappedRef = useRef(false)

  const skip = !me || !getAuthToken() || me.disabled === true || accountDisabled

  const {
    data,
    loading,
    refetch: refetchQuery,
  } = useQuery<MyNotificationsQuery>(MyNotifications, {
    variables: { first: PAGE_SIZE, unreadOnly: false },
    skip,
    fetchPolicy: 'cache-and-network',
    pollInterval: skip ? 0 : POLL_MS,
    notifyOnNetworkStatusChange: true,
  })

  const baseItems = data?.me?.notifications?.items ?? []
  const items = baseItems.filter(
    (item) => !item.isClosed && !hiddenIds.has(item.id),
  )
  const unreadCount = countUnreadNotifications(items)
  const canClose = Boolean(data)

  const refetch = useCallback(async () => {
    if (skip) return
    await refetchQuery()
  }, [refetchQuery, skip])

  const [markReadMutation] =
    useMutation<MarkNotificationReadMutation>(MarkNotificationRead)
  const [markAllReadMutation] = useMutation<MarkAllNotificationsReadMutation>(
    MarkAllNotificationsRead,
  )
  const [closeMutation] = useMutation(MarkNotificationClosed)
  const [dismissMutation] = useMutation(DismissNotification)
  const [dismissReviewMutation] = useMutation(DismissReviewPrompt)

  const markRead = useCallback(
    async (id: string) => {
      await markReadMutation({ variables: { id } })
      await refetch()
    },
    [markReadMutation, refetch],
  )

  const markAllRead = useCallback(async () => {
    await markAllReadMutation()
    await refetch()
  }, [markAllReadMutation, refetch])

  const closeNotification = useCallback(
    async (id: string) => {
      setHiddenIds((current) => new Set(current).add(id))
      try {
        await closeMutation({ variables: { id } })
        await refetch()
      } catch {
        setHiddenIds((current) => {
          const next = new Set(current)
          next.delete(id)
          return next
        })
        showAppToast({
          title: notices.closeFailed,
          type: 'error',
        })
      }
    },
    [closeMutation, notices.closeFailed, refetch],
  )

  const dismissPopup = useCallback(
    async (item: AppNotification) => {
      if (popupDismissKind(item) === 'review-prompt') {
        await dismissReviewMutation({ variables: { id: item.id } })
      } else {
        await dismissMutation({ variables: { id: item.id } })
      }
      await refetch()
    },
    [dismissMutation, dismissReviewMutation, refetch],
  )

  useEffect(() => {
    if (skip) {
      bootstrappedRef.current = false
      toastedIdsRef.current = new Set()
      return
    }
    if (loading && items.length === 0) return
    const plan = notificationToastPlan({
      items,
      bootstrapped: bootstrappedRef.current,
      seenIds: toastedIdsRef.current,
    })
    toastedIdsRef.current = plan.seenIds
    bootstrappedRef.current = true
    for (const id of plan.toastIds) {
      const item = items.find((entry) => entry.id === id)
      if (!item) continue
      const { title, description } = notificationDisplayText(item)
      showAppToast({ title, description, type: 'info' })
    }
  }, [items, loading, skip])

  const value = useMemo<NotificationsContextValue>(
    () => ({
      items,
      unreadCount,
      loading: loading && items.length === 0,
      canClose,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      refetch,
      markRead,
      markAllRead,
      closeNotification,
      dismissPopup,
    }),
    [
      canClose,
      closeNotification,
      dismissPopup,
      drawerOpen,
      items,
      loading,
      markAllRead,
      markRead,
      refetch,
      unreadCount,
    ],
  )

  return (
    <NotificationsContext.Provider value={value}>
      <WebPushSync />
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) {
    throw new Error(
      'useNotifications must be used within NotificationsProvider',
    )
  }
  return ctx
}

export function useNotificationsOptional() {
  return useContext(NotificationsContext)
}
