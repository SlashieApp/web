'use client'

import { Container, Heading, Stack, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

import { TaskCard } from '@/app/(task)/components/ui/TaskCard'
import type { TaskCardTask } from '@/app/(task)/components/ui/TaskCard'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'

type PublicUserOpenTasksProps = {
  pending?: boolean
  tasks?: TaskCardTask[]
  countLabel?: string
  heading: string
  emptyLabel: string
  /** `{title}` template for the card's accessible name. */
  viewTaskLabel: string
}

/** Poster-owned open tasks. Each card links to the public task page. */
export function PublicUserOpenTasks({
  pending = false,
  tasks = [],
  countLabel,
  heading,
  emptyLabel,
  viewTaskLabel,
}: PublicUserOpenTasksProps) {
  const router = useRouter()
  const localize = useLocalizedHref()

  return (
    <Container py={{ base: 6, md: 8 }}>
      <Stack gap={4} maxW="3xl">
        <Stack gap={1}>
          <Heading size="lg" color="text.default">
            {heading}
          </Heading>
          {pending ? null : countLabel ? (
            <Text color="text.muted" fontSize="sm">
              {countLabel}
            </Text>
          ) : null}
        </Stack>
        {pending ? (
          <Stack gap={3} aria-busy>
            <TaskCard loading />
            <TaskCard loading />
          </Stack>
        ) : tasks.length === 0 ? (
          <Text color="text.muted">{emptyLabel}</Text>
        ) : (
          <Stack gap={3}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                detailsHref={`/tasks/${task.id}`}
                showDetailsCta
                navigateOnActivate
                activateAriaLabel={formatMessage(viewTaskLabel, {
                  title: task.title,
                })}
                onActivate={() => {
                  router.push(localize(`/tasks/${task.id}`))
                }}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  )
}
