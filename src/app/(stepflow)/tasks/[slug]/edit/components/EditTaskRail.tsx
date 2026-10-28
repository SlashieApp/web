'use client'

import { HStack, Stack, Text } from '@chakra-ui/react'
import { LuCircleHelp, LuEye, LuShieldCheck } from 'react-icons/lu'

import { TaskStatusPill } from '@/app/(task)/tasks/[slug]/components/ui/TaskStatusPill'
import { LEGAL_CONTACT_EMAIL } from '@/content/legal/company'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { SAFETY_HREF } from '@/utils/appRoutes'
import { Link } from '@ui'

import bag from '../i11n.json'

function useQuoteCount(liveQuotes: number): string | null {
  const r = useI11n(bag).rail
  if (liveQuotes === 0) return null
  return liveQuotes === 1
    ? r.oneQuote
    : formatMessage(r.quotes, { count: liveQuotes })
}

/**
 * Desktop rail beside the edit form: where the task stands, the task itself
 * and the guest view, and help.
 */
export function EditTaskRail({
  taskId,
  liveQuotes,
}: {
  taskId: string
  liveQuotes: number
}) {
  const r = useI11n(bag).rail
  const quotes = useQuoteCount(liveQuotes)

  return (
    <Stack gap={6} fontSize="sm">
      <HStack gap={2}>
        <TaskStatusPill status="OPEN" size="sm" />
        {quotes ? <Text color="text.muted">{quotes}</Text> : null}
      </HStack>
      <Stack gap={2}>
        <Link href={`/tasks/${taskId}`} fontWeight={500}>
          {r.viewTask}
        </Link>
        <Link
          href={`/tasks/${taskId}/preview`}
          fontWeight={500}
          display="inline-flex"
          alignItems="center"
          gap={1.5}
        >
          <LuEye aria-hidden />
          {r.preview}
        </Link>
      </Stack>
      <Stack gap={2}>
        <Text fontWeight={500} color="text.default">
          {r.helpHeading}
        </Text>
        <Link
          href={SAFETY_HREF}
          display="inline-flex"
          alignItems="center"
          gap={1.5}
        >
          <LuShieldCheck aria-hidden />
          {r.safety}
        </Link>
        <Link
          href={`mailto:${LEGAL_CONTACT_EMAIL}`}
          display="inline-flex"
          alignItems="center"
          gap={1.5}
        >
          <LuCircleHelp aria-hidden />
          {r.contactSupport}
        </Link>
      </Stack>
    </Stack>
  )
}

/** Phones: the status and the guest view in one row above the form. */
export function EditTaskMobileBar({
  taskId,
  liveQuotes,
}: {
  taskId: string
  liveQuotes: number
}) {
  const r = useI11n(bag).rail
  const quotes = useQuoteCount(liveQuotes)

  return (
    <HStack
      gap={3}
      justify="space-between"
      px={4}
      py={2}
      bg="bg.surface"
      borderBottomWidth="1px"
      borderColor="border.default"
      fontSize="sm"
    >
      <HStack gap={2}>
        <TaskStatusPill status="OPEN" size="sm" />
        {quotes ? <Text color="text.muted">{quotes}</Text> : null}
      </HStack>
      <Link
        href={`/tasks/${taskId}/preview`}
        fontWeight={500}
        display="inline-flex"
        alignItems="center"
        gap={1.5}
        minH="44px"
      >
        <LuEye aria-hidden />
        {r.preview}
      </Link>
    </HStack>
  )
}
