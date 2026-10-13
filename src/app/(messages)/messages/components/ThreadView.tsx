'use client'

import { useApolloClient, useMutation, useQuery } from '@apollo/client/react'
import { Box, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { ThreadKind } from '@codegen/schema'
import type {
  MessageThreadQuery,
  SendMessageMutation,
  ThreadFieldsFragment,
  ThreadItemFieldsFragment,
} from '@codegen/schema'
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { LuArrowLeft, LuEllipsis } from 'react-icons/lu'

import {
  THREAD_PAGE_SIZE,
  useMessages,
} from '@/app/(messages)/messages/context/MessagesProvider'
import BlockUser from '@/app/(messages)/messages/graphql/BlockUser.gql'
import MarkThreadRead from '@/app/(messages)/messages/graphql/MarkThreadRead.gql'
import MessageThread from '@/app/(messages)/messages/graphql/MessageThread.gql'
import SendMessage from '@/app/(messages)/messages/graphql/SendMessage.gql'
import UnblockUser from '@/app/(messages)/messages/graphql/UnblockUser.gql'
import { useLocale } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { showAppToast } from '@/utils/appToast'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { Button, Dropdown, IconButton, Link, Textarea } from '@ui'

import { wasNotSelected } from '../helpers/messagesFormat'
import bag from '../i11n.json'
import { ThreadTimelineItem } from './ThreadTimelineItem'

type Copy = (typeof bag)['en']

const MESSAGE_MAX = 2000

/** Why there is no composer here, or null when the viewer can send. */
function composerNotice(
  thread: ThreadFieldsFragment,
  items: readonly ThreadItemFieldsFragment[],
  t: Copy,
): string | null {
  if (thread.canSend) return null
  if (thread.kind === ThreadKind.System) return t.systemNotice
  const name = thread.otherParty?.name ?? ''
  if (thread.blockedByMe) return formatMessage(t.blockedNotice, { name })
  if (wasNotSelected(items)) return t.notSelectedNotice
  return t.lockedNotice
}

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

/** One conversation: header, timeline (oldest at the top) and composer. */
export function ThreadView({ threadId }: { threadId: string }) {
  const t = useI11n(bag)
  const locale = useLocale() === 'zh-hk' ? 'zh-HK' : 'en-GB'
  const { refetchThreads } = useMessages()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [exhausted, setExhausted] = useState(false)
  const [loadingEarlier, setLoadingEarlier] = useState(false)

  const { data, loading, error, fetchMore, refetch } =
    useQuery<MessageThreadQuery>(MessageThread, {
      variables: { threadId, first: THREAD_PAGE_SIZE },
      fetchPolicy: 'cache-and-network',
    })
  const [markRead] = useMutation(MarkThreadRead)
  const [block] = useMutation(BlockUser)
  const [unblock] = useMutation(UnblockUser)

  const thread = data?.thread ?? null
  const items = data?.threadItems ?? []
  const newestId = items[0]?.id

  // Opening the thread, and each new item while it is open, marks it read.
  useEffect(() => {
    if (!thread || thread.unreadCount === 0) return
    void markRead({ variables: { threadId } }).then(() => refetchThreads())
  }, [markRead, refetchThreads, thread, threadId])

  // Follow the newest item down.
  useEffect(() => {
    if (!newestId) return
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [newestId])

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

  if (!thread) {
    return (
      <Stack flex={1} align="center" justify="center" gap={3} px={6}>
        <Text
          fontSize="sm"
          color="text.muted"
          role={error ? 'alert' : undefined}
        >
          {loading ? t.loading : t.loadError}
        </Text>
        {loading ? null : (
          <HStack gap={3}>
            <Button size="sm" variant="secondary" onClick={() => refetch()}>
              {t.retry}
            </Button>
            <Link href="/messages" fontSize="sm" fontWeight={600}>
              {t.back}
            </Link>
          </HStack>
        )}
      </Stack>
    )
  }

  const timeline = [...items].reverse()
  const notice = composerNotice(thread, items, t)
  const party = thread.otherParty
  const name = party?.name ?? thread.title
  const canBlock = Boolean(party && !party.deleted)

  return (
    <>
      <HStack
        gap={2}
        px={{ base: 2, lg: 4 }}
        py={2.5}
        borderBottomWidth="1px"
        borderColor="border.default"
      >
        <IconButton
          asChild
          variant="ghost"
          aria-label={t.back}
          display={{ base: 'inline-flex', lg: 'none' }}
        >
          <Link href="/messages">
            <LuArrowLeft aria-hidden />
          </Link>
        </IconButton>
        <Stack gap={0} minW={0} flex={1}>
          <Heading as="h2" fontSize="md" fontWeight={700} lineClamp={1}>
            {thread.title}
          </Heading>
          <Text fontSize="xs" color="text.muted" lineClamp={1}>
            {thread.kind === ThreadKind.System
              ? t.systemSubtitle
              : (party?.name ?? t.awaitingWorker)}
          </Text>
        </Stack>
        {thread.task ? (
          <Button asChild size="sm" variant="ghost">
            <Link
              href={`/tasks/${thread.task.id}`}
              _hover={{ textDecoration: 'none' }}
            >
              {t.viewTask}
            </Link>
          </Button>
        ) : null}
        {canBlock ? (
          <Dropdown
            contentLabel={t.threadMenu}
            align="end"
            width="220px"
            trigger={
              <IconButton variant="ghost" aria-label={t.threadMenu}>
                <LuEllipsis aria-hidden />
              </IconButton>
            }
          >
            <Button
              variant="ghost"
              w="full"
              justifyContent="flex-start"
              onClick={() => void toggleBlock()}
            >
              {formatMessage(thread.blockedByMe ? t.unblock : t.block, {
                name,
              })}
            </Button>
          </Dropdown>
        ) : null}
      </HStack>

      <Box
        ref={scrollRef}
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
          <Stack gap={3} role="log" aria-label={thread.title}>
            {timeline.map((item) => (
              <ThreadTimelineItem key={item.id} item={item} locale={locale} />
            ))}
          </Stack>
        </Stack>
      </Box>

      {notice ? (
        <Box
          px={4}
          py={3}
          borderTopWidth="1px"
          borderColor="border.default"
          bg="bg.subtle"
        >
          <Text fontSize="sm" color="text.muted">
            {notice}
          </Text>
        </Box>
      ) : (
        <Composer threadId={threadId} name={name} t={t} />
      )}
    </>
  )
}
