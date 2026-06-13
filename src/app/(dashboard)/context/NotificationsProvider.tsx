'use client'

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
} from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import MarkAllNotificationsRead from '@/app/(dashboard)/dashboard/graphql/MarkAllNotificationsRead.gql'
import MarkNotificationRead from '@/app/(dashboard)/dashboard/graphql/MarkNotificationRead.gql'
import MyNotifications from '@/app/(dashboard)/dashboard/graphql/MyNotifications.gql'
import { showAppToast } from '@/utils/appToast'
import { getAuthToken } from '@/utils/auth'
import {
  countUnreadNotifications,
  notificationDisplayText,
} from '@/utils/notifications'

const POLL_MS = 45_000
const PAGE_SIZE = 30

type NotificationsContextValue = {
  items: NonNullable<
    NonNullable<MyNotificationsQuery['me']>['notifications']
  >['items']
  unreadCount: number
  loading: boolean
  drawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  refetch: () => Promise<void>
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
)

export function NotificationsProvider({
  children,
}: { children: React.ReactNode }) {
  const me = useUserStore((s) => s.me)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const toastedIdsRef = useRef<Set<string>>(new Set())
  const bootstrappedRef = useRef(false)

  const skip = !me || !getAuthToken()

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

  const items = data?.me?.notifications?.items ?? []
  const unreadCount = countUnreadNotifications(items)

  const refetch = useCallback(async () => {
    if (skip) return
    await refetchQuery()
  }, [refetchQuery, skip])

  const [markReadMutation] =
    useMutation<MarkNotificationReadMutation>(MarkNotificationRead)
  const [markAllReadMutation] = useMutation<MarkAllNotificationsReadMutation>(
    MarkAllNotificationsRead,
  )

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
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      refetch,
      markRead,
      markAllRead,
    }),
    [drawerOpen, items, loading, markAllRead, markRead, refetch, unreadCount],
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
