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
import type { MessageThreadQuery, SendMessageMutation } from '@codegen/schema'
import {
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  THREAD_PAGE_SIZE,
  useMessages,
} from '@/app/(messages)/messages/context/MessagesProvider'
import BlockUser from '@/app/(messages)/messages/graphql/BlockUser.gql'
import MarkThreadRead from '@/app/(messages)/messages/graphql/MarkThreadRead.gql'
import MessageThread from '@/app/(messages)/messages/graphql/MessageThread.gql'
import SendMessage from '@/app/(messages)/messages/graphql/SendMessage.gql'
import UnblockUser from '@/app/(messages)/messages/graphql/UnblockUser.gql'
import { TaskDetailProvider } from '@/app/(task)/tasks/[slug]/context/TaskDetailProvider'
import { useLocale } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { showAppToast } from '@/utils/appToast'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { Button, Link, Textarea } from '@ui'

import { wasNotSelected } from '../helpers/messagesFormat'
import { threadQueryState, timelineRows } from '../helpers/messagesThread'
import bag from '../i11n.json'
import { THREAD_VIEWS, getThreadView } from '../views'
import { ThreadAttentionRefresh } from './ThreadAttentionRefresh'
import { ThreadBottomPin } from './ThreadBottomPin'
import { ThreadHeader } from './ThreadHeader'
import { ThreadTimelineItem } from './ThreadTimelineItem'

type Copy = (typeof bag)['en']

const MESSAGE_MAX = 2000

function Composer({
  threadId,
  name,
  t,
}: {
  threadId: string
  name: string
  t: Copy
}) {
  const apollo = useApolloClient()
  const { refetchThreads } = useMessages()
  const [body, setBody] = useState('')
  const [send, { loading }] = useMutation<SendMessageMutation>(SendMessage)
  const text = body.trim()

  const submit = async () => {
    if (!text || loading) return
    try {
      const result = await send({ variables: { threadId, body: text } })
      const item = result.data?.sendMessage
      if (item) {
        apollo.cache.updateQuery<MessageThreadQuery>(
          {
            query: MessageThread,
            variables: { threadId, first: THREAD_PAGE_SIZE },
          },
          (prev) =>
            prev && !prev.threadItems.some((row) => row.id === item.id)
              ? { ...prev, threadItems: [item, ...prev.threadItems] }
              : prev,
        )
      }
      setBody('')
      refetchThreads()
    } catch (error) {
      showAppToast({
        title: getFriendlyErrorMessage(error, t.sendFailed),
        type: 'error',
      })
    }
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
        void submit()
      }}
    >
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
          if (e.key !== 'Enter' || e.shiftKey || e.nativeEvent.isComposing)
            return
          e.preventDefault()
          void submit()
        }}
        rows={1}
        maxLength={MESSAGE_MAX}
        resize="none"
        minH="44px"
        maxH="160px"
        autoresize
        placeholder={t.composerPlaceholder}
        aria-label={formatMessage(t.composerLabel, { name })}
      />
      <Button type="submit" loading={loading} disabled={!text}>
        {t.send}
      </Button>
    </HStack>
  )
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
 * One conversation: header with the top pin, timeline (oldest at the top),
 * the bottom pin when something needs the viewer, then the composer. Task
 * threads run inside the task's `TaskDetailProvider`, so the menu and both
 * pins share task detail's state and controls. What shows is the thread's
 * named view (`getThreadView`, views/README.md).
 */
export function ThreadView({ threadId }: { threadId: string | null }) {
  const t = useI11n(bag)
  const locale = useLocale() === 'zh-hk' ? 'zh-HK' : 'en-GB'
  const { refetchThreads } = useMessages()
  const scrollRef = useRef<HTMLDivElement>(null)
  const atEndRef = useRef(true)
  const [exhausted, setExhausted] = useState(false)
  const [loadingEarlier, setLoadingEarlier] = useState(false)

  const { data, loading, error, fetchMore, refetch } =
    useQuery<MessageThreadQuery>(MessageThread, {
      variables: { threadId: threadId ?? '', first: THREAD_PAGE_SIZE },
      skip: !threadId,
      fetchPolicy: 'cache-and-network',
    })
  const [markRead] = useMutation(MarkThreadRead)
  const [block] = useMutation(BlockUser)
  const [unblock] = useMutation(UnblockUser)

  const thread = data?.thread ?? null
  const items = data?.threadItems ?? []
  const newestId = items[0]?.id
  const config =
    THREAD_VIEWS[
      getThreadView({
        threadId,
        query: threadQueryState({ loading, thread, error }),
        thread,
        notSelected: wasNotSelected(items),
      })
    ]

  // Opening the thread, and each new item while it is open, marks it read.
  useEffect(() => {
    if (!thread || thread.unreadCount === 0) return
    void markRead({ variables: { threadId: thread.id } }).then(() =>
      refetchThreads(),
    )
  }, [markRead, refetchThreads, thread])

  // Follow the newest item down.
  useEffect(() => {
    if (!newestId) return
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [newestId])

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
        title: getFriendlyErrorMessage(err, t.blockFailed),
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
          <Text fontSize="sm" fontWeight={config.body ? 700 : 400}>
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
          <Link href="/messages" fontSize="sm" fontWeight={600}>
            {t.back}
          </Link>
        </HStack>
      </Centered>
    )
  }

  if (!thread) return null
  const name = thread.otherParty?.name ?? thread.title
  const rows = timelineRows([...items].reverse(), locale, t)
  const pins = config.pins && thread.task != null

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
                  fontWeight={600}
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
                />
              ),
            )}
          </Stack>
        </Stack>
      </Box>

      {pins ? <ThreadBottomPin attention={thread.attention} /> : null}

      {config.composer === 'open' ? (
        <Composer threadId={thread.id} name={name} t={t} />
      ) : (
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
      )}
    </>
  )

  if (!pins || !thread.task) return conversation
  return (
    <TaskDetailProvider taskId={thread.task.id} captureView={false}>
      {conversation}
    </TaskDetailProvider>
  )
}
