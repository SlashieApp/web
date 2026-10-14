'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { ThreadItemType } from '@codegen/schema'
import type { ThreadItemFieldsFragment } from '@codegen/schema'

import { useI11n } from '@/i18n/useI11n'
import { Button, Link } from '@ui'

import { flashAction, formatMessageTime } from '../helpers/messagesFormat'
import bag from '../i11n.json'
import { ThreadQuote } from './ThreadQuote'

/**
 * One timeline entry: a chat bubble (mine on the right) or a flash card for
 * an event (quote, booking, review prompt, announcement). Quote flashes carry
 * the quote itself, with owner actions (BE-81). The header opens the task and
 * holds the one Report for the conversation (FE-267).
 */
export function ThreadTimelineItem({
  item,
  locale,
}: {
  item: ThreadItemFieldsFragment
  locale: string
}) {
  const t = useI11n(bag)
  const time = formatMessageTime(item.createdAt, locale, t)

  if (item.type === ThreadItemType.Flash) {
    const action = flashAction(item)
    return (
      <Stack
        alignSelf="center"
        w="full"
        maxW="420px"
        gap={2}
        p={4}
        borderRadius="lg"
        borderWidth="1px"
        borderColor="border.default"
        bg="bg.subtle"
      >
        {item.imageUrl ? (
          <Box borderRadius="md" overflow="hidden">
            <img
              src={item.imageUrl}
              alt=""
              style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }}
            />
          </Box>
        ) : null}
        <HStack justify="space-between" align="baseline" gap={3}>
          <Text fontWeight={700} fontSize="sm">
            {item.title}
          </Text>
          <Text fontSize="xs" color="text.muted" flexShrink={0}>
            {time}
          </Text>
        </HStack>
        {item.body ? (
          <Text fontSize="sm" color="text.muted" whiteSpace="pre-line">
            {item.body}
          </Text>
        ) : null}
        {item.quote ? <ThreadQuote quote={item.quote} locale={locale} /> : null}
        {action?.kind === 'review' ? (
          <Box>
            <Button asChild size="sm" variant="secondary">
              <Link href={action.href} _hover={{ textDecoration: 'none' }}>
                {t.leaveReview}
              </Link>
            </Button>
          </Box>
        ) : null}
      </Stack>
    )
  }

  const mine = item.isMine
  return (
    <Stack
      alignSelf={mine ? 'flex-end' : 'flex-start'}
      maxW="80%"
      gap={1}
      align={mine ? 'flex-end' : 'flex-start'}
    >
      <Box
        px={3.5}
        py={2}
        borderRadius="xl"
        borderBottomRightRadius={mine ? 'sm' : 'xl'}
        borderBottomLeftRadius={mine ? 'xl' : 'sm'}
        bg={mine ? 'action.primary' : 'bg.subtle'}
        color={mine ? 'text.onGreen' : 'text.default'}
      >
        <Text fontSize="sm" whiteSpace="pre-wrap" wordBreak="break-word">
          {item.body}
        </Text>
      </Box>
      <Text fontSize="xs" color="text.muted">
        {time}
      </Text>
    </Stack>
  )
}
