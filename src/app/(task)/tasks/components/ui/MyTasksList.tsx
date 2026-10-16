'use client'

import { Box, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'

import { TaskCard } from '@/app/(task)/components/ui/TaskCard'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Button, Link } from '@ui'

import type { MyTaskHubSection } from '../../helpers/myTasksHub'
import bag from '../../i11n.json'
import type { MyTasksAction, MyTasksViewConfig } from '../../views'
import { MyTaskCard } from './MyTaskCard'

/** Completed shows the newest few until asked for the rest. */
const COMPLETED_PREVIEW = 3

export type MyTasksListProps = {
  config: MyTasksViewConfig
  sections: readonly MyTaskHubSection[]
  /** Search, a category or Hosted / Quoted is set: Completed shows in full. */
  filtered: boolean
  errorMessage: string | null
  onRetry: () => void
  onClearFilters: () => void
  onOpen: (taskId: string) => void
}

function ActionButton({
  action,
  primary,
  onRetry,
  onClearFilters,
}: {
  action: MyTasksAction
  primary: boolean
  onRetry: () => void
  onClearFilters: () => void
}) {
  const t = useI11n(bag)
  const label = t.views.actions[action]
  const variant = primary ? 'primary' : 'secondary'
  if (action === 'postTask' || action === 'browseTasks') {
    return (
      <Button asChild variant={variant}>
        <Link
          href={action === 'postTask' ? '/tasks/create' : '/search'}
          _hover={{ textDecoration: 'none' }}
        >
          {label}
        </Link>
      </Button>
    )
  }
  return (
    <Button
      type="button"
      variant={variant}
      onClick={action === 'retry' ? onRetry : onClearFilters}
    >
      {label}
    </Button>
  )
}

function SectionGroup({
  section,
  collapsible,
  onOpen,
}: {
  section: MyTaskHubSection
  collapsible: boolean
  onOpen: (taskId: string) => void
}) {
  const t = useI11n(bag)
  const [showAll, setShowAll] = useState(false)
  const collapsed =
    collapsible && !showAll && section.rows.length > COMPLETED_PREVIEW
  const rows = collapsed
    ? section.rows.slice(0, COMPLETED_PREVIEW)
    : section.rows

  return (
    <Stack as="section" gap={3} aria-label={t.sections[section.id]}>
      <Heading
        as="h2"
        fontSize="md"
        fontWeight={700}
        color="text.default"
        letterSpacing="-0.01em"
      >
        {t.sections[section.id]} ({section.rows.length})
      </Heading>
      <Stack gap={3}>
        {rows.map((row) => (
          <MyTaskCard key={row.id} row={row} onOpen={onOpen} />
        ))}
      </Stack>
      {collapsible && section.rows.length > COMPLETED_PREVIEW ? (
        <Button
          type="button"
          variant="ghost"
          alignSelf="flex-start"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll
            ? t.showFewer
            : formatMessage(t.showAll, { count: section.rows.length })}
        </Button>
      ) : null}
    </Stack>
  )
}

/**
 * The list column of My Tasks, rendered from the view config: card
 * placeholders, a message with its buttons, or the status groups (Booked /
 * In progress, Open, Completed). No status logic here; `getMyTasksView`
 * picks the config.
 */
export function MyTasksList({
  config,
  sections,
  filtered,
  errorMessage,
  onRetry,
  onClearFilters,
  onOpen,
}: MyTasksListProps) {
  const t = useI11n(bag)

  if (config.body === 'skeleton') {
    return (
      <Stack gap={3} aria-busy="true">
        <Text srOnly aria-live="polite">
          {t.loading}
        </Text>
        <TaskCard loading />
        <TaskCard loading />
        <TaskCard loading />
      </Stack>
    )
  }

  if (config.body === 'message' && config.message) {
    const copy = t.views[config.message]
    const description =
      config.message === 'error'
        ? errorMessage
        : 'description' in copy
          ? copy.description
          : null
    return (
      <Stack
        gap={3}
        maxW="36rem"
        py={4}
        role={config.message === 'error' ? 'alert' : undefined}
      >
        <Heading as="h2" size="md" color="text.default">
          {copy.title}
        </Heading>
        {description ? (
          <Text fontSize="sm" color="text.muted" lineHeight="1.5">
            {description}
          </Text>
        ) : null}
        <HStack gap={2} flexWrap="wrap">
          {config.actions.map((action, index) => (
            <ActionButton
              key={action}
              action={action}
              primary={index === 0}
              onRetry={onRetry}
              onClearFilters={onClearFilters}
            />
          ))}
        </HStack>
      </Stack>
    )
  }

  return (
    <Stack gap={8}>
      {errorMessage ? (
        <HStack
          gap={3}
          role="alert"
          justify="space-between"
          align="center"
          flexWrap="wrap"
        >
          <Text fontSize="sm" color="text.muted">
            {errorMessage}
          </Text>
          <Button type="button" variant="ghost" size="sm" onClick={onRetry}>
            {t.views.actions.retry}
          </Button>
        </HStack>
      ) : null}
      {sections.map((section) => (
        <SectionGroup
          key={section.id}
          section={section}
          collapsible={section.id === 'completed' && !filtered}
          onOpen={onOpen}
        />
      ))}
      <Box aria-hidden h={1} />
    </Stack>
  )
}
