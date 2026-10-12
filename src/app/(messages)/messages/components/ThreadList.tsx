'use client'

import { Badge, Box, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { ThreadItemType, ThreadKind } from '@codegen/schema'
import type { ThreadFieldsFragment } from '@codegen/schema'

import { useMessages } from '@/app/(messages)/messages/context/MessagesProvider'
import { useLocale } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Avatar, Button, Link } from '@ui'

import { formatMessageTime, threadPreviewText } from '../helpers/messagesFormat'
import bag from '../i11n.json'

type Copy = (typeof bag)['en']

/** Inbox subtitle: the other party; the Slashie thread names itself. */
function threadSubtitle(thread: ThreadFieldsFragment, t: Copy): string {
  if (thread.kind === ThreadKind.System) return t.systemSubtitle
  return thread.otherParty?.name ?? t.awaitingWorker
}

function ThreadRow({
  thread,
  selected,
  locale,
  t,
}: {
  thread: ThreadFieldsFragment
  selected: boolean
  locale: string
  t: Copy
}) {
  const system = thread.kind === ThreadKind.System
  const last = thread.lastItem
  const preview = threadPreviewText(last)
  const mine = last?.isMine && last.type === ThreadItemType.Message
  const unread = thread.unreadCount > 0

  return (
    <Link
      href={`/messages/${thread.id}`}
      aria-current={selected ? 'page' : undefined}
      display="flex"
      gap={3}
      px={4}
      py={3}
      bg={selected ? 'bg.subtle' : 'transparent'}
      borderBottomWidth="1px"
      borderColor="border.default"
      color="text.default"
      _hover={{ textDecoration: 'none', bg: 'bg.subtle' }}
    >
      <Avatar
        name={system ? t.slashie : (thread.otherParty?.name ?? thread.title)}
        src={system ? undefined : (thread.otherParty?.avatarUrl ?? undefined)}
        size="md"
      />
      <Stack gap={0.5} minW={0} flex={1}>
        <HStack justify="space-between" gap={2}>
          <Text fontWeight={unread ? 800 : 600} fontSize="sm" lineClamp={1}>
            {thread.title}
          </Text>
          <Text fontSize="xs" color="text.muted" flexShrink={0}>
            {formatMessageTime(last?.createdAt ?? thread.updatedAt, locale, t)}
          </Text>
        </HStack>
        <Text fontSize="xs" color="text.muted" lineClamp={1}>
          {threadSubtitle(thread, t)}
        </Text>
        <HStack justify="space-between" gap={2}>
          <Text
            fontSize="sm"
            color={unread ? 'text.default' : 'text.muted'}
            lineClamp={1}
          >
            {mine ? `${t.you}: ${preview}` : preview}
          </Text>
          {unread ? (
            <Badge
              flexShrink={0}
              minW="20px"
              h="20px"
              px={1.5}
              borderRadius="full"
              justifyContent="center"
              bg="status.success.solid"
              color="text.onGreen"
              fontSize="11px"
              fontWeight={700}
              aria-label={formatMessage(t.unread, {
                count: thread.unreadCount,
              })}
            >
              {thread.unreadCount > 99 ? '99+' : thread.unreadCount}
            </Badge>
          ) : null}
        </HStack>
      </Stack>
    </Link>
  )
}

/** Task threads and the Slashie thread, most recently active first. */
export function ThreadList({ selectedId }: { selectedId: string | null }) {
  const t = useI11n(bag)
  const locale = useLocale() === 'zh-hk' ? 'zh-HK' : 'en-GB'
  const { threads, loading, error, refetchThreads } = useMessages()

  return (
    <>
      <Box px={4} py={4} borderBottomWidth="1px" borderColor="border.default">
        <Heading as="h1" size="lg">
          {t.title}
        </Heading>
      </Box>
      <Box flex={1} minH={0} overflowY="auto">
        {loading ? (
          <Text px={4} py={6} fontSize="sm" color="text.muted">
            {t.loading}
          </Text>
        ) : error ? (
          <Stack px={4} py={6} gap={3} align="flex-start" role="alert">
            <Text fontSize="sm">{t.loadError}</Text>
            <Button size="sm" variant="secondary" onClick={refetchThreads}>
              {t.retry}
            </Button>
          </Stack>
        ) : threads.length === 0 ? (
          <Stack px={4} py={8} gap={1}>
            <Text fontWeight={700}>{t.emptyTitle}</Text>
            <Text fontSize="sm" color="text.muted">
              {t.emptyBody}
            </Text>
          </Stack>
        ) : (
          <nav aria-label={t.title}>
            {threads.map((thread) => (
              <ThreadRow
                key={thread.id}
                thread={thread}
                selected={thread.id === selectedId}
                locale={locale}
                t={t}
              />
            ))}
          </nav>
        )}
      </Box>
    </>
  )
}
