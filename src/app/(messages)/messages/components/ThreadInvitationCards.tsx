'use client'

import { HStack, Stack, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useContext } from 'react'
import { LuChevronRight } from 'react-icons/lu'

import { TaskCard } from '@/app/(task)/components/ui/TaskCard'
import { taskBudgetBag } from '@/app/(task)/helpers/taskBudget/taskBudget'
import { TaskDetailContext } from '@/app/(task)/tasks/[slug]/context/TaskDetailContext'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { sdlFocusRing, sdlMotion } from '@/theme/styles'
import { Avatar, Badge, Link, Rating } from '@ui'

import {
  type InvitedWorker,
  invitedWorkerCard,
  threadTaskCard,
} from '../helpers/threadInvitation'
import bag from '../i11n.json'

/** The frame the thread's quote card uses: white, a hairline, 12px corners. */
const FRAME = {
  w: 'full',
  p: 3,
  bg: 'bg.surface',
  borderRadius: 'lg',
  borderWidth: '1px',
  borderColor: 'border.default',
} as const

/**
 * The worker a customer asked to quote, under their "Asked to quote" line
 * (FE-608, Ryan 23 Nov): photo, name, the Pro badge and their rating. The
 * card opens their profile. A deleted account is plain text with no link.
 */
export function ThreadWorkerCard({
  worker,
  taskId,
}: {
  worker: InvitedWorker
  taskId?: string | null
}) {
  const t = useI11n(bag)
  const card = invitedWorkerCard(worker, {
    fallbackName: t.quote.workerFallback,
    taskId,
  })
  const body = (
    <HStack gap={3} align="center">
      <Avatar name={card.name} src={card.avatarUrl ?? undefined} size="lg" />
      <Stack gap={0.5} flex={1} minW={0}>
        <HStack gap={1.5} minW={0}>
          <Text fontSize="sm" fontWeight={500} truncate>
            {card.name}
          </Text>
          {card.pro ? (
            <Badge
              variant="premium"
              shape="pill"
              size="sm"
              flexShrink={0}
              aria-label={t.invitation.proBadgeLabel}
            >
              {t.invitation.proBadge}
            </Badge>
          ) : null}
        </HStack>
        {card.ratingLabel ? (
          <Rating
            value={card.ratingLabel}
            size="sm"
            label={t.invitation.rating}
          />
        ) : (
          <Text fontSize="xs" color="text.muted">
            {t.invitation.noReviews}
          </Text>
        )}
      </Stack>
      {card.profileHref ? (
        <LuChevronRight
          size={16}
          aria-hidden
          color="var(--chakra-colors-text-subtle)"
        />
      ) : null}
    </HStack>
  )

  if (!card.profileHref) {
    return (
      <Stack data-thread-worker-card={card.userId} gap={0} {...FRAME}>
        {body}
      </Stack>
    )
  }
  return (
    <Link
      href={card.profileHref}
      data-thread-worker-card={card.userId}
      aria-label={formatMessage(t.invitation.viewProfile, { name: card.name })}
      display="block"
      color="text.default"
      transitionProperty="border-color"
      transitionDuration={sdlMotion.duration.moderate}
      _hover={{ textDecoration: 'none', borderColor: 'border.hover' }}
      _focusVisible={sdlFocusRing}
      css={{
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }}
      {...FRAME}
    >
      {body}
    </Link>
  )
}

/**
 * The task a worker was asked to quote on, under their "Asked to quote" line
 * (FE-608, Ryan 23 Nov): the app's own task card, as the home list draws it.
 * It opens the task. Renders inside the thread's `TaskDetailProvider`.
 */
export function ThreadTaskCard() {
  const t = useI11n(bag)
  const budgetCopy = useI11n(taskBudgetBag)
  const router = useRouter()
  const localize = useLocalizedHref()
  const task = useContext(TaskDetailContext)?.task ?? null
  if (!task) return null
  return (
    <Stack data-thread-task-card={task.id} gap={0} w="full">
      <TaskCard
        task={threadTaskCard(task, budgetCopy)}
        activateAriaLabel={formatMessage(t.invitation.viewTask, {
          title: task.title,
        })}
        onActivate={() => router.push(localize(`/tasks/${task.id}`))}
        // No ⋮ on the card: the thread's own menu is in its header.
        menu={false}
      />
    </Stack>
  )
}
