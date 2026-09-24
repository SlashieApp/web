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
import DismissNotification from '@/app/(dashboard)/dashboard/graphql/DismissNotification.graphql'
import DismissReviewPrompt from '@/app/(dashboard)/dashboard/graphql/DismissReviewPrompt.graphql'
import MarkAllNotificationsRead from '@/app/(dashboard)/dashboard/graphql/MarkAllNotificationsRead.gql'
import MarkNotificationClosed from '@/app/(dashboard)/dashboard/graphql/MarkNotificationClosed.graphql'
import MarkNotificationRead from '@/app/(dashboard)/dashboard/graphql/MarkNotificationRead.gql'
import MyNotificationSurfaces from '@/app/(dashboard)/dashboard/graphql/MyNotificationSurfaces.graphql'
import MyNotifications from '@/app/(dashboard)/dashboard/graphql/MyNotifications.gql'
import { popupDismissKind } from '@/content/reviews/reviewModel'
import { showAppToast } from '@/utils/appToast'
import { getAuthToken } from '@/utils/auth'
import { isGraphQLSchemaMismatch } from '@/utils/graphqlSchemaMismatch'
import {
  countUnreadNotifications,
  notificationDisplayText,
} from '@/utils/notifications'

type NotificationSurface = {
  id: string
  isPopup?: boolean | null
  isClosed?: boolean | null
  dismissedAt?: string | null
  imageUrl?: string | null
  extraCtaUrl?: string | null
}

type NotificationSurfacesQuery = {
  me?: {
    notifications?: { items?: NotificationSurface[] | null } | null
  } | null
}

export type AppNotification = NonNullable<
  NonNullable<MyNotificationsQuery['me']>['notifications']
>['items'][number] &
  Partial<NotificationSurface>

const POLL_MS = 45_000
const PAGE_SIZE = 30

type NotificationsContextValue = {
  items: AppNotification[]
  unreadCount: number
  loading: boolean
  /** Close (isClosed) is available when the surfaces query matches the API. */
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
  const [pauseSurfaces, setPauseSurfaces] = useState(false)
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

  const surfaces = useQuery<NotificationSurfacesQuery>(MyNotificationSurfaces, {
    variables: { first: PAGE_SIZE },
    skip: skip || pauseSurfaces,
    fetchPolicy: 'cache-and-network',
    pollInterval: skip || pauseSurfaces ? 0 : POLL_MS,
    errorPolicy: 'all',
  })
  if (
    surfaces.error &&
    !pauseSurfaces &&
    isGraphQLSchemaMismatch(surfaces.error)
  ) {
    setPauseSurfaces(true)
  }

  const surfaceById = new Map(
    (surfaces.data?.me?.notifications?.items ?? []).map((item) => [
      item.id,
      item,
    ]),
  )
  const canClose = Boolean(surfaces.data) && !pauseSurfaces
  const baseItems = data?.me?.notifications?.items ?? []
  const items: AppNotification[] = baseItems
    .map((item) => ({ ...item, ...surfaceById.get(item.id) }))
    .filter((item) => !item.isClosed && !hiddenIds.has(item.id))
  const unreadCount = countUnreadNotifications(items)

  const refetch = useCallback(async () => {
    if (skip) return
    await refetchQuery()
    if (!pauseSurfaces) await surfaces.refetch()
  }, [pauseSurfaces, refetchQuery, skip, surfaces])

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
      const orderId = item.orderId?.trim()
      if (popupDismissKind(item) === 'review-prompt' && orderId) {
        await dismissReviewMutation({ variables: { orderId } })
      } else {
        await dismissMutation({ variables: { id: item.id } })
      }
      await refetch()
    },
    [dismissMutation, dismissReviewMutation, refetch],
  )

  useEffect(() => {
    if (skip || items.length === 0) return
    if (!bootstrappedRef.current) {
      for (const item of items) {
        toastedIdsRef.current.add(item.id)
      }
      bootstrappedRef.current = true
      return
    }
    for (const item of items) {
      if (item.readAt || toastedIdsRef.current.has(item.id)) continue
      toastedIdsRef.current.add(item.id)
      const { title, description } = notificationDisplayText(item)
      showAppToast({ title, description, type: 'info' })
    }
  }, [items, skip])

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
