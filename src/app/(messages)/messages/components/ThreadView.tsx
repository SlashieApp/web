'use client'

import { useApolloClient, useMutation, useQuery } from '@apollo/client/react'
import {
  Box,
  HStack,
  Skeleton,
  Stack,
  Text,
  VisuallyHidden,
} from '@chakra-ui/react'
import {
  FlashKind,
  type MarkThreadReadMutation,
  type MessageThreadQuery,
  type MessageThreadsQuery,
  type SendMessageMutation,
} from '@codegen/schema'
import {
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

import {
  THREAD_PAGE_SIZE,
  useMessages,
} from '@/app/(messages)/messages/context/MessagesProvider'
import BlockUser from '@/app/(messages)/messages/graphql/BlockUser.gql'
import MarkThreadRead from '@/app/(messages)/messages/graphql/MarkThreadRead.gql'
import MessageThread from '@/app/(messages)/messages/graphql/MessageThread.gql'
import MessageThreads from '@/app/(messages)/messages/graphql/MessageThreads.gql'
import SendMessage from '@/app/(messages)/messages/graphql/SendMessage.gql'
import UnblockUser from '@/app/(messages)/messages/graphql/UnblockUser.gql'
import { taskServerError } from '@/app/(stepflow)/tasks/create/helpers/taskFieldError'
import { TaskDetailContext } from '@/app/(task)/tasks/[slug]/context/TaskDetailContext'
import { TaskDetailProvider } from '@/app/(task)/tasks/[slug]/context/TaskDetailProvider'
import { useLocale } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { showAppToast } from '@/utils/appToast'
import { getGraphQLErrorCode } from '@/utils/graphqlErrors'
import { Button, Link, Textarea } from '@ui'

import {
  readAttemptKey,
  threadQueryState,
  timelineRows,
  unreadAfterRead,
} from '../helpers/messagesThread'
import {
  type OutboxMessage,
  inThreadOrder,
  outboxDelivered,
  outboxShown,
  outboxStore,
} from '../helpers/outbox'
import { outboxTimelineItem } from '../helpers/outboxItem'
import bag from '../i11n.json'
import {
  THREAD_VIEWS,
  type ThreadViewInput,
  getThreadView,
  threadOtherBooking,
} from '../views'
import { ThreadAttentionRefresh } from './ThreadAttentionRefresh'
import { ThreadHeader } from './ThreadHeader'
import { THREAD_COMPOSER_ATTR, ThreadSheetProvider } from './ThreadSheet'
import { ThreadTimelineItem, type UnsentState } from './ThreadTimelineItem'

type Copy = (typeof bag)['en']

const MESSAGE_MAX = 2000

/**
 * The message box. Send puts the message in the conversation at once and
 * empties the box (motion group B, Ryan 22 Nov): it never waits for the
 * server, so the next message can be written straight away.
 */
function Composer({
  name,
  t,
  onSend,
}: {
  name: string
  t: Copy
  /** The trimmed text: it joins the conversation and goes to the server. */
  onSend: (text: string) => void
}) {
  const [body, setBody] = useState('')
  const text = body.trim()

  const submit = () => {
    if (!text) return
    setBody('')
    onSend(text)
  }

  return (
    <HStack
      as="form"
      align="flex-end"
      gap={2}
      p={3}
      borderTopWidth="1px"
      borderColor="border.default"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
          if (e.key !== 'Enter' || e.shiftKey || e.nativeEvent.isComposing)
            return
          e.preventDefault()
          submit()
        }}
        rows={1}
        maxLength={MESSAGE_MAX}
        resize="none"
        minH="44px"
        maxH="160px"
        autoresize
        {...{ [THREAD_COMPOSER_ATTR]: '' }}
        placeholder={t.composerPlaceholder}
        aria-label={formatMessage(t.composerLabel, { name })}
      />
      <Button type="submit" disabled={!text}>
        {t.send}
      </Button>
    </HStack>
  )
}

/**
 * Under the timeline: the composer, or the line that says why you can't
 * send. A task thread runs inside its `TaskDetailProvider`: its
 * `permissions.isFrozen` (BE-108) turns the "once a quote is accepted" line
 * into "Messaging is paused" (`thread.suspended`), and its view says when
 * someone else is booked or done (BE-113), so the line says that instead.
 */
function ThreadComposerArea({
  view,
  name,
  t,
  onSend,
}: {
  view: Omit<ThreadViewInput, 'suspended' | 'otherBooking'>
  name: string
  t: Copy
  onSend: (text: string) => void
}) {
  const detail = useContext(TaskDetailContext)
  const suspended = Boolean(detail?.permissions.isFrozen)
  const otherBooking = detail ? threadOtherBooking(detail.view) : null
  const config =
    THREAD_VIEWS[getThreadView({ ...view, suspended, otherBooking })]
  if (config.layout !== 'conversation') return null

  if (config.composer === 'open') {
    return <Composer name={name} t={t} onSend={onSend} />
  }
  return (
    <Box
      px={4}
      py={3}
      borderTopWidth="1px"
      borderColor="border.default"
      bg="bg.subtle"
    >
      <Text fontSize="sm" color="text.muted">
        {formatMessage(t[config.composer], { name })}
      </Text>
    </Box>
  )
}

/**
 * What an unsent message says under its bubble. Nothing while it is on its
 * way or just sent (it looks like any message); once it has failed, the line
 * to tap, or the reason when trying again won't help.
 */
function unsentFor(
  message: OutboxMessage | undefined,
  t: Copy,
  retry: (message: OutboxMessage) => void,
): UnsentState | undefined {
  if (!message) return undefined
  if (message.status !== 'failed') return { failed: null }
  return message.reason
    ? {
        failed: {
          line: formatMessage(t.notSentBecause, { reason: message.reason }),
        },
      }
    : { failed: { line: t.notSent, onRetry: () => retry(message) } }
}

const SKELETON_BUBBLES = [
  { mine: false, w: '55%' },
  { mine: true, w: '40%' },
  { mine: false, w: '65%' },
  { mine: true, w: '30%' },
] as const

/** Within this many pixels of the end counts as reading the newest item. */
const AT_END_PX = 24

/** First load: the header bar and a few bubbles. */
function ThreadSkeleton({ label }: { label: string }) {
  return (
    <Stack flex={1} minH={0} gap={0} aria-busy="true">
      <VisuallyHidden>{label}</VisuallyHidden>
      <HStack
        px={{ base: 4, lg: 5 }}
        py={4}
        borderBottomWidth="1px"
        borderColor="border.default"
        aria-hidden
      >
        <Skeleton h="20px" w="50%" borderRadius="md" />
      </HStack>
      <Stack gap={3} px={{ base: 3, lg: 6 }} py={4} aria-hidden>
        {SKELETON_BUBBLES.map((bubble, index) => (
          <Skeleton
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed placeholder list
            key={index}
            alignSelf={bubble.mine ? 'flex-end' : 'flex-start'}
            h="40px"
            w={bubble.w}
            borderRadius="xl"
          />
        ))}
      </Stack>
    </Stack>
  )
}

function Centered({ children }: { children: ReactNode }) {
  return (
    <Stack
      flex={1}
      align="center"
      justify="center"
      gap={3}
      px={6}
      textAlign="center"
    >
      {children}
    </Stack>
  )
}

/**
 * One conversation: header with the top pin (the booking card once booked),
 * timeline (oldest at the top), then the composer. Task threads run inside
 * the task's `TaskDetailProvider`, so the menu, the pin and the thread's sheet
 * share task detail's state and controls; the sheet (FE-543) rises over the
 * composer with a quote's or the booking's detail and actions. What shows is
 * the thread's named view (`getThreadView`, views/README.md).
 */
export function ThreadView({ threadId }: { threadId: string | null }) {
  const t = useI11n(bag)
  const locale = useLocale() === 'zh-hk' ? 'zh-HK' : 'en-GB'
  const { refetchThreads } = useMessages()
  const scrollRef = useRef<HTMLDivElement>(null)
  const columnRef = useRef<HTMLDivElement>(null)
  const atEndRef = useRef(true)
  const [exhausted, setExhausted] = useState(false)
  const [loadingEarlier, setLoadingEarlier] = useState(false)

  const { data, loading, error, fetchMore, refetch } =
    useQuery<MessageThreadQuery>(MessageThread, {
      variables: { threadId: threadId ?? '', first: THREAD_PAGE_SIZE },
      skip: !threadId,
      fetchPolicy: 'cache-and-network',
    })
  const [markRead] = useMutation<MarkThreadReadMutation>(MarkThreadRead)
  const readTried = useRef<string | null>(null)
  const [block] = useMutation(BlockUser)
  const [unblock] = useMutation(UnblockUser)
  const [sendMessage] = useMutation<SendMessageMutation>(SendMessage)
  const apollo = useApolloClient()
  const outbox = useSyncExternalStore(
    outboxStore.subscribe,
    outboxStore.get,
    outboxStore.getServer,
  )

  const thread = data?.thread ?? null
  const items = data?.threadItems ?? []
  const newestId = items[0]?.id
  // Your messages the server has not confirmed yet: they show at once, after
  // everything it has sent (motion group B, Ryan 22 Nov).
  const serverIds = useMemo(
    () => new Set(items.map((item) => item.id)),
    [items],
  )
  const unsent = threadId ? outboxShown(outbox, threadId, serverIds) : []
  const lastUnsentId = unsent.at(-1)?.id
  // A sent message steps aside once the server's own item is in the
  // timeline; then it is done with.
  useEffect(() => {
    const done = outboxDelivered(outbox, serverIds)
    if (done.length) outboxStore.remove(done)
  }, [outbox, serverIds])

  /** To the server, one at a time per conversation. It never throws. */
  const deliver = useCallback(
    (message: OutboxMessage) =>
      inThreadOrder(message.threadId, async () => {
        try {
          const result = await sendMessage({
            variables: { threadId: message.threadId, body: message.body },
          })
          const item = result.data?.sendMessage
          if (!item) {
            outboxStore.fail(message.id, null)
            return
          }
          apollo.cache.updateQuery<MessageThreadQuery>(
            {
              query: MessageThread,
              variables: {
                threadId: message.threadId,
                first: THREAD_PAGE_SIZE,
              },
            },
            (prev) =>
              prev && !prev.threadItems.some((row) => row.id === item.id)
                ? { ...prev, threadItems: [item, ...prev.threadItems] }
                : prev,
          )
          outboxStore.sent(message.id, item.id)
          refetchThreads()
        } catch (error) {
          // A suspension: trying again won't help, so the line says why.
          const code = getGraphQLErrorCode(error)
          const reasons: Record<string, string> = t.serverErrors
          outboxStore.fail(message.id, (code && reasons[code]) || null)
        }
      }),
    [apollo, refetchThreads, sendMessage, t.serverErrors],
  )
  const send = (text: string) => {
    if (!threadId) return
    void deliver(outboxStore.add(threadId, text))
  }
  const retry = (message: OutboxMessage) => {
    outboxStore.retry(message.id)
    void deliver(message)
  }
  const view = {
    threadId,
    query: threadQueryState({ loading, thread, error }),
    thread,
  }
  // Layout and pins; a suspension or someone else's booking only changes the
  // composer line, which `ThreadComposerArea` works out inside the task's
  // provider.
  const config =
    THREAD_VIEWS[
      getThreadView({ ...view, suspended: false, otherBooking: null })
    ]

  // Opening the thread, and each new item while it is open, marks it read.
  // The dot and the badge clear at once, without waiting for the server
  // (motion group B, Ryan 22 Nov); if it refuses, they come back.
  useEffect(() => {
    if (!thread || thread.unreadCount === 0) return
    const unread = thread.unreadCount
    // One try per state of the thread: a refusal puts the count back as it
    // was, which must not start the same request again.
    const key = readAttemptKey(thread.id, unread, newestId)
    if (readTried.current === key) return
    readTried.current = key
    markRead({
      variables: { threadId: thread.id },
      // The generated type leaves `__typename` out; the cache needs it to
      // find the thread.
      optimisticResponse: {
        markThreadRead: { __typename: 'Thread', id: thread.id, unreadCount: 0 },
      } as MarkThreadReadMutation,
      update: (cache) => {
        cache.updateQuery<MessageThreadsQuery>(
          { query: MessageThreads },
          (prev) =>
            prev?.me
              ? {
                  ...prev,
                  me: {
                    ...prev.me,
                    unreadMessageCount: unreadAfterRead(
                      prev.me.unreadMessageCount,
                      unread,
                    ),
                  },
                }
              : prev,
        )
      },
    })
      .then(() => refetchThreads())
      .catch(() => undefined)
  }, [markRead, newestId, refetchThreads, thread])

  // Follow the newest item down: the server's, or the one just written.
  const tailId = lastUnsentId ?? newestId
  useEffect(() => {
    if (!tailId) return
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [tailId])

  // The pins load with the task and change size; while the reader is at the
  // newest item, keep it in view instead of letting them push it out.
  const timelineRef = useCallback((node: HTMLDivElement | null) => {
    scrollRef.current = node
    if (!node) return
    const observer = new ResizeObserver(() => {
      if (atEndRef.current) node.scrollTop = node.scrollHeight
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const loadEarlier = useCallback(async () => {
    const oldest = items.at(-1)
    const el = scrollRef.current
    if (!oldest || loadingEarlier) return
    setLoadingEarlier(true)
    const fromBottom = el ? el.scrollHeight - el.scrollTop : 0
    try {
      const result = await fetchMore({ variables: { before: oldest.id } })
      if ((result.data?.threadItems.length ?? 0) < THREAD_PAGE_SIZE) {
        setExhausted(true)
      }
      // Keep the reader where they were after older items land on top.
      requestAnimationFrame(() => {
        if (el) el.scrollTop = el.scrollHeight - fromBottom
      })
    } finally {
      setLoadingEarlier(false)
    }
  }, [fetchMore, items, loadingEarlier])

  const toggleBlock = async () => {
    const party = thread?.otherParty
    if (!party) return
    const vars = { variables: { userId: party.userId } }
    try {
      await (thread.blockedByMe ? unblock(vars) : block(vars))
      showAppToast({
        title: formatMessage(thread.blockedByMe ? t.unblocked : t.blocked, {
          name: party.name,
        }),
        type: 'success',
      })
      void refetch()
    } catch (err) {
      showAppToast({
        title: taskServerError(t.serverErrors, err, t.blockFailed),
        type: 'error',
      })
    }
  }

  if (config.layout === 'pick') {
    return (
      <Centered>
        <Text color="text.muted" fontSize="sm">
          {t.pickThread}
        </Text>
      </Centered>
    )
  }

  if (config.layout === 'skeleton') return <ThreadSkeleton label={t.loading} />

  if (config.layout === 'status') {
    return (
      <Centered>
        <Stack gap={1} role={config.retry ? 'alert' : undefined}>
          <Text fontSize="sm" fontWeight={config.body ? 500 : 400}>
            {t[config.title]}
          </Text>
          {config.body ? (
            <Text fontSize="sm" color="text.muted">
              {t[config.body]}
            </Text>
          ) : null}
        </Stack>
        <HStack gap={3}>
          {config.retry ? (
            <Button size="sm" variant="secondary" onClick={() => refetch()}>
              {t.retry}
            </Button>
          ) : null}
          <Link href="/messages" fontSize="sm" fontWeight={500}>
            {t.back}
          </Link>
        </HStack>
      </Centered>
    )
  }

  if (!thread) return null
  const name = thread.otherParty?.name ?? thread.title
  const unsentById = new Map(unsent.map((message) => [message.id, message]))
  const rows = timelineRows(
    [...[...items].reverse(), ...unsent.map(outboxTimelineItem)],
    locale,
    t,
  )
  const pins = config.pins && thread.task != null
  // The newest reschedule or cancel request offers to open it (FE-543).
  const latestRequestId = [...items].find(
    (item) =>
      item.flashKind === FlashKind.RescheduleRequested ||
      item.flashKind === FlashKind.CancellationRequested,
  )?.id

  const conversation = (
    <>
      {pins ? <ThreadAttentionRefresh key={thread.task?.id} /> : null}
      <ThreadHeader thread={thread} onToggleBlock={() => void toggleBlock()} />

      <Box
        ref={timelineRef}
        onScroll={(e) => {
          const el = e.currentTarget
          atEndRef.current =
            el.scrollHeight - el.scrollTop - el.clientHeight <= AT_END_PX
        }}
        flex={1}
        minH={0}
        overflowY="auto"
        px={{ base: 3, lg: 6 }}
        py={4}
      >
        <Stack gap={3}>
          {items.length >= THREAD_PAGE_SIZE && !exhausted ? (
            <Button
              alignSelf="center"
              size="sm"
              variant="ghost"
              loading={loadingEarlier}
              onClick={() => void loadEarlier()}
            >
              {t.loadEarlier}
            </Button>
          ) : null}
          {/* A log region reads new messages out as they arrive. */}
          <Stack gap={2} role="log" aria-label={thread.title}>
            {rows.map((row) =>
              row.kind === 'day' ? (
                <Text
                  key={row.key}
                  alignSelf="center"
                  pt={2}
                  fontSize="xs"
                  fontWeight={500}
                  color="text.muted"
                >
                  {row.label}
                </Text>
              ) : (
                <ThreadTimelineItem
                  key={row.item.id}
                  item={row.item}
                  locale={locale}
                  showTime={row.showTime}
                  latestRequest={row.item.id === latestRequestId}
                  unsent={unsentFor(unsentById.get(row.item.id), t, retry)}
                />
              ),
            )}
          </Stack>
        </Stack>
      </Box>

      <ThreadComposerArea view={view} name={name} t={t} onSend={send} />
    </>
  )

  if (!pins || !thread.task) return conversation
  // The sheet rises from the foot of this column, over the composer (FE-543).
  return (
    <TaskDetailProvider taskId={thread.task.id} captureView={false}>
      <Stack
        ref={columnRef}
        data-thread-column=""
        flex={1}
        minH={0}
        gap={0}
        position="relative"
        overflow="hidden"
      >
        <ThreadSheetProvider
          container={columnRef}
          attention={thread.attention}
          locale={locale}
        >
          {conversation}
        </ThreadSheetProvider>
      </Stack>
    </TaskDetailProvider>
  )
}
