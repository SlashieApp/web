'use client'

import {
  useApolloClient,
  useQuery,
  useSubscription,
} from '@apollo/client/react'
import type {
  MessageThreadQuery,
  MessageThreadsQuery,
  ThreadFieldsFragment,
  ThreadItemAddedSubscription,
} from '@codegen/schema'
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import { WebPushSync } from '@/app/(dashboard)/components/notifications/WebPushSync'
import MessageThread from '@/app/(messages)/messages/graphql/MessageThread.gql'
import MessageThreads from '@/app/(messages)/messages/graphql/MessageThreads.gql'
import ThreadItemAdded from '@/app/(messages)/messages/graphql/ThreadItemAdded.gql'
import {
  getAccountDisabledFlag,
  subscribeAccountDisabled,
} from '@/utils/accountDisabledState'
import { restartRealtimeConnection } from '@/utils/apolloClient'
import { getAuthToken } from '@/utils/auth'

/** Thread items fetched per page (newest first). */
export const THREAD_PAGE_SIZE = 50

export type MessagesContextValue = {
  threads: readonly ThreadFieldsFragment[]
  /** Unread flashes and messages across threads (badge). */
  unreadCount: number
  loading: boolean
  error: boolean
  refetchThreads: () => void
}

/** Exported for stories; app code uses the provider and hooks. */
export const MessagesContext = createContext<MessagesContextValue | null>(null)

/**
 * Messages for the signed-in user (FE-202): the inbox, the unread badge and
 * live `threadItemAdded` updates. A new item refreshes the inbox and joins
 * the open thread's cached timeline. Also keeps the Web Push subscription
 * registered, since flashes push.
 */
export function MessagesProvider({ children }: { children: ReactNode }) {
  const apollo = useApolloClient()
  const meId = useUserStore((s) => s.me?.id ?? null)
  const disabled = useSyncExternalStore(
    subscribeAccountDisabled,
    getAccountDisabledFlag,
    () => false,
  )
  const signedIn = Boolean(meId) && !disabled && Boolean(getAuthToken())

  const { data, loading, error, refetch } = useQuery<MessageThreadsQuery>(
    MessageThreads,
    { skip: !signedIn, fetchPolicy: 'cache-and-network' },
  )

  // A new account needs a socket that carries its token.
  const lastMeIdRef = useRef(meId)
  useEffect(() => {
    if (lastMeIdRef.current === meId) return
    lastMeIdRef.current = meId
    restartRealtimeConnection()
  }, [meId])

  useSubscription<ThreadItemAddedSubscription>(ThreadItemAdded, {
    skip: !signedIn,
    onData: ({ data: event }) => {
      const item = event.data?.threadItemAdded
      if (!item) return
      apollo.cache.updateQuery<MessageThreadQuery>(
        {
          query: MessageThread,
          variables: { threadId: item.threadId, first: THREAD_PAGE_SIZE },
        },
        (prev) =>
          prev && !prev.threadItems.some((row) => row.id === item.id)
            ? { ...prev, threadItems: [item, ...prev.threadItems] }
            : prev,
      )
      void refetch()
    },
  })

  const value = useMemo<MessagesContextValue>(
    () => ({
      threads: data?.me?.threads ?? [],
      unreadCount: data?.me?.unreadMessageCount ?? 0,
      loading: loading && !data,
      error: Boolean(error) && !data,
      refetchThreads: () => {
        void refetch()
      },
    }),
    [data, error, loading, refetch],
  )

  return (
    <MessagesContext.Provider value={value}>
      {signedIn ? <WebPushSync /> : null}
      {children}
    </MessagesContext.Provider>
  )
}

export function useMessages(): MessagesContextValue {
  const ctx = useContext(MessagesContext)
  if (!ctx) throw new Error('useMessages must be used within MessagesProvider')
  return ctx
}

/** Badge readers outside the provider (stories) get null. */
export function useMessagesOptional(): MessagesContextValue | null {
  return useContext(MessagesContext)
}
