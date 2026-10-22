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

/** Past shows the newest few until asked for the rest. */
const PAST_PREVIEW = 3

export type MyTasksListProps = {
  config: MyTasksViewConfig
  /** Upcoming, Open and Past, in that order. */
  sections: readonly MyTaskHubSection[]
  /** Search, a category or Hosted / Quoted is set: only sections with matches show, Past in full. */
  filtered: boolean
  errorMessage: string | null
  onRetry: () => void
  onClearFilters: () => void
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

/**
 * One section. Upcoming is all cards; Open is all rows; Past leads with a
 * card for the newest, then rows, collapsed to the newest few unless
 * filtering. An empty section says so.
 */
function Section({
  section,
  filtered,
}: {
  section: MyTaskHubSection
  filtered: boolean
}) {
  const t = useI11n(bag)
  const [showAll, setShowAll] = useState(false)
  const label = t.sections[section.id]
  const collapsible =
    section.id === 'past' && !filtered && section.rows.length > PAST_PREVIEW
  const rows =
    collapsible && !showAll ? section.rows.slice(0, PAST_PREVIEW) : section.rows

  return (
    <Stack as="section" gap={3} aria-label={label}>
      <Heading
        as="h2"
        fontSize="lg"
        fontWeight={700}
        color="text.default"
        letterSpacing="-0.01em"
      >
        {label}
      </Heading>
      {rows.length === 0 ? (
        <Text fontSize="sm" color="text.muted">
          {t.sectionEmpty[section.id]}
        </Text>
      ) : (
        <Stack as="ul" gap={2} listStyleType="none" m={0} p={0}>
          {rows.map((row, index) => (
            <li key={row.id}>
              <MyTaskCard
                row={row}
                layout={
                  section.id === 'upcoming' ||
                  (section.id === 'past' && index === 0)
                    ? 'card'
                    : 'row'
                }
              />
            </li>
          ))}
        </Stack>
      )}
      {collapsible ? (
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
 * The list column of My Tasks, rendered from the view config: placeholders,
 * a message with its buttons, or the sections (Upcoming, Open, Past). No
 * status logic here; `getMyTasksView` picks the config and
 * `buildMyTasksHub` the sections.
 */
export function MyTasksList({
  config,
  sections,
  filtered,
  errorMessage,
  onRetry,
  onClearFilters,
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

  // While filtering, a section with no matches is left out.
  const shown = filtered
    ? sections.filter((section) => section.rows.length > 0)
    : sections

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
      {shown.map((section) => (
        <Section key={section.id} section={section} filtered={filtered} />
      ))}
      <Box aria-hidden h={1} />
    </Stack>
  )
}
