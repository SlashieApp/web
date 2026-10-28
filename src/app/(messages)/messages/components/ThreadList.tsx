'use client'

import {
  Badge,
  Box,
  HStack,
  Heading,
  Skeleton,
  Stack,
  Text,
  VisuallyHidden,
  useBreakpointValue,
} from '@chakra-ui/react'
import { ThreadItemType, ThreadKind } from '@codegen/schema'
import type { ThreadFieldsFragment } from '@codegen/schema'
import { useMemo, useRef, useState } from 'react'
import { LuSearch, LuSlidersHorizontal, LuX } from 'react-icons/lu'

import { useUserStore } from '@/app/(auth)/store/user'
import { useMessages } from '@/app/(messages)/messages/context/MessagesProvider'
import { useLocale } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { sdlFigure } from '@/theme/styles'
import {
  Avatar,
  Button,
  Drawer,
  IconButton,
  Input,
  Link,
  RadioButton,
} from '@ui'

import { useInboxSearch } from '../context/InboxSearchProvider'
import { formatMessageTime, threadPreviewText } from '../helpers/messagesFormat'
import { INBOX_FILTERS, filterThreads } from '../helpers/messagesInbox'
import { threadTitle } from '../helpers/messagesThread'
import bag from '../i11n.json'
import { INBOX_VIEWS, getInboxView } from '../views'

type Copy = (typeof bag)['en']

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
          <Text fontWeight={unread ? 600 : 500} fontSize="sm" lineClamp={1}>
            {threadTitle(thread, t)}
          </Text>
          <Text fontSize="xs" color="text.muted" flexShrink={0}>
            {formatMessageTime(last?.createdAt ?? thread.updatedAt, locale, t)}
          </Text>
        </HStack>
        <Text fontSize="xs" color="text.muted" lineClamp={1}>
          {system ? t.systemSubtitle : (thread.task?.title ?? thread.title)}
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
              {...sdlFigure}
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

/**
 * The search box and the filter button above the rows. The button opens a
 * drawer (a bottom sheet on phones) with one choice: picking it applies it
 * and closes the drawer. A dot on the button says a filter is on.
 */
function InboxSearch({ t }: { t: Copy }) {
  const { searchText, filter, setSearchText, setFilter } = useInboxSearch()
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const placement =
    useBreakpointValue({ base: 'bottom', lg: 'end' } as const, {
      fallback: 'base',
    }) ?? 'bottom'
  const filterOn = filter !== 'all'

  return (
    <HStack gap={2}>
      <Input
        ref={inputRef}
        pill
        type="search"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder={t.inbox.search}
        aria-label={t.inbox.search}
        autoComplete="off"
        enterKeyHint="search"
        rootProps={{ flex: 1, minW: 0 }}
        startElement={<LuSearch size={18} strokeWidth={2} aria-hidden />}
        endElement={
          searchText ? (
            <IconButton
              type="button"
              aria-label={t.inbox.clearSearch}
              boxSize="32px"
              minW="32px"
              minH="32px"
              onClick={() => {
                setSearchText('')
                inputRef.current?.focus()
              }}
            >
              <LuX size={16} strokeWidth={2} aria-hidden />
            </IconButton>
          ) : undefined
        }
      />
      <Box position="relative" flexShrink={0}>
        <IconButton
          ref={buttonRef}
          type="button"
          aria-label={filterOn ? t.inbox.filterActive : t.inbox.filter}
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
        >
          <LuSlidersHorizontal size={20} aria-hidden />
        </IconButton>
        {filterOn ? (
          <Box
            aria-hidden
            position="absolute"
            top="8px"
            right="8px"
            boxSize="12px"
            borderRadius="full"
            borderWidth="2px"
            borderColor="bg.surface"
            bg="action.primary"
            pointerEvents="none"
          />
        ) : null}
      </Box>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        title={t.inbox.filter}
        placement={placement}
        finalFocusEl={() => buttonRef.current}
      >
        <Stack gap={2} role="radiogroup" aria-label={t.inbox.filter}>
          {INBOX_FILTERS.map((value) => (
            <RadioButton
              key={value}
              role="radio"
              checked={filter === value}
              label={t.inbox.filters[value]}
              onChange={() => {
                setFilter(value)
                setOpen(false)
              }}
            />
          ))}
        </Stack>
      </Drawer>
    </HStack>
  )
}

/** First load: rows shaped like threads. */
function InboxSkeleton({ label }: { label: string }) {
  return (
    <Box aria-busy="true">
      <VisuallyHidden>{label}</VisuallyHidden>
      {[0, 1, 2].map((row) => (
        <HStack
          key={row}
          gap={3}
          px={4}
          py={3}
          borderBottomWidth="1px"
          borderColor="border.default"
          aria-hidden
        >
          <Skeleton boxSize="40px" borderRadius="full" flexShrink={0} />
          <Stack gap={2} flex={1}>
            <Skeleton h="14px" w="60%" borderRadius="md" />
            <Skeleton h="12px" w="85%" borderRadius="md" />
          </Stack>
        </HStack>
      ))}
    </Box>
  )
}

/**
 * Task threads and the Slashie thread, most recently active first: each row
 * names the other person (or, for the poster before booking, how many
 * workers quoted) over the task. Above them, a search box and a filter
 * narrow the list on the device (FE-362). What shows is the inbox's named
 * view (`getInboxView`, views/README.md).
 */
export function ThreadList({ selectedId }: { selectedId: string | null }) {
  const t = useI11n(bag)
  const locale = useLocale() === 'zh-hk' ? 'zh-HK' : 'en-GB'
  const { threads, loading, error, refetchThreads } = useMessages()
  const { searchText, filter, setSearchText, setFilter } = useInboxSearch()
  const meId = useUserStore((s) => s.me?.id ?? null)
  const matches = useMemo(
    () => filterThreads(threads, { searchText, filter, meId }),
    [threads, searchText, filter, meId],
  )
  const { body, search } =
    INBOX_VIEWS[
      getInboxView({
        query: loading ? 'loading' : error ? 'error' : 'ready',
        threadCount: threads.length,
        matchCount: matches.length,
      })
    ]

  return (
    <>
      <Stack
        gap={3}
        px={4}
        py={4}
        borderBottomWidth="1px"
        borderColor="border.default"
      >
        <Heading as="h2" size="lg">
          {t.title}
        </Heading>
        {search ? <InboxSearch t={t} /> : null}
      </Stack>
      <Box flex={1} minH={0} overflowY="auto">
        {body === 'skeleton' ? (
          <InboxSkeleton label={t.loading} />
        ) : body === 'error' ? (
          <Stack px={4} py={6} gap={3} align="flex-start" role="alert">
            <Text fontSize="sm">{t.loadError}</Text>
            <Button size="sm" variant="secondary" onClick={refetchThreads}>
              {t.retry}
            </Button>
          </Stack>
        ) : body === 'empty' ? (
          <Stack px={4} py={8} gap={1}>
            <Text fontWeight={500}>{t.emptyTitle}</Text>
            <Text fontSize="sm" color="text.muted">
              {t.emptyBody}
            </Text>
          </Stack>
        ) : body === 'noMatches' ? (
          <Stack px={4} py={8} gap={3} align="flex-start">
            <Text as="output" display="block" fontWeight={500}>
              {t.inbox.noMatchTitle}
            </Text>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                setSearchText('')
                setFilter('all')
              }}
            >
              {t.inbox.clearSearchAndFilter}
            </Button>
          </Stack>
        ) : (
          <nav aria-label={t.title}>
            {matches.map((thread) => (
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
