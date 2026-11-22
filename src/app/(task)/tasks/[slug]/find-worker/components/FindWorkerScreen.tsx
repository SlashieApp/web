'use client'

import {
  Box,
  HStack,
  Skeleton,
  SkeletonCircle,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LuCheck } from 'react-icons/lu'

import { publicProfilePath } from '@/app/helpers/publicProfilePath'
import {
  QUOTE_INVITE_LIMITS,
  quoteInviteUsage,
} from '@/content/quoteInvitations/limits'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import {
  Avatar,
  Badge,
  Button,
  Link,
  PageLayout,
  Rating,
  StatusCard,
} from '@ui'

import {
  type FindWorkerMatch,
  type FindWorkerRow,
  type FindWorkerState,
  findWorkerLeftLabel,
  findWorkerRows,
} from '../helpers/findWorker'
import bag from '../i11n.json'

export type FindWorkerScreenProps = {
  taskId: string
  loading?: boolean
  /** Why the API refused the list; null when it answered. */
  refused?: FindWorkerState | null
  task?: {
    title?: string | null
    categories?: readonly string[] | null
    quoteInvitationLimit?: number | null
    quoteInvitationsLeft?: number | null
  } | null
  matches?: readonly FindWorkerMatch[] | null
  onRetry: () => void
  /**
   * Sends the invitation for one row (`useAskWorkerToQuote`); true once it
   * went through. Only a tap on Ask to quote calls it.
   */
  onAsk: (row: FindWorkerRow) => Promise<boolean>
  /** An invitation is on its way: every Ask button waits. */
  asking?: boolean
  /** Why the last one was not sent, shown on its row. */
  askError?: string | null
}

const LOADING_ROWS = ['a', 'b', 'c', 'd'] as const

/** Where each refusal's button leads; `error` retries in place. */
function refusedHref(state: FindWorkerState, taskId: string): string | null {
  if (state === 'proRequired') return '/pricing'
  if (state === 'closed') return `/tasks/${taskId}`
  if (state === 'unavailable') return '/tasks'
  return null
}

/**
 * Find worker (FE-603, BE-149; Ryan 22 Nov): the workers who fit the owner's
 * open task, best match first, each with Ask to quote. Asking is the same
 * invitation as on a worker's profile (`askWorkerToQuote`); the worker gets a
 * notification and decides. A worker already asked stays in the list, marked
 * Asked. The Expo app's Find worker screen has the same rows, in the same
 * order, with the same words.
 */
export function FindWorkerScreen({
  taskId,
  loading = false,
  refused = null,
  task = null,
  matches = null,
  onRetry,
  onAsk,
  asking = false,
  askError = null,
}: FindWorkerScreenProps) {
  const t = useI11n(bag)
  const router = useRouter()
  const localize = useLocalizedHref()
  // The worker the last tap asked: their row carries the spinner or the error.
  const [askingId, setAskingId] = useState<string | null>(null)
  // Asked here since the list was read, so the row changes at once.
  const [askedHere, setAskedHere] = useState<readonly string[]>([])

  const rows = findWorkerRows(matches, t)
  const usage = task ? quoteInviteUsage(task) : null
  // Each one asked here uses one of what the API said was left.
  const pending = rows.filter(
    (row) => !row.alreadyAsked && askedHere.includes(row.workerUserId),
  ).length
  const left = usage ? Math.max(0, usage.left - pending) : null
  const leftLabel =
    usage && left != null
      ? findWorkerLeftLabel({ limit: usage.limit, left }, t)
      : null
  const taskTitle = task?.title?.trim() || null
  const categories = (task?.categories ?? []).filter(Boolean).join(', ')

  const askRow = async (row: FindWorkerRow) => {
    setAskingId(row.workerUserId)
    if (!(await onAsk(row))) return
    setAskedHere((ids) => [...ids, row.workerUserId])
    setAskingId(null)
  }

  const back = () => router.push(localize(`/tasks/${taskId}`))

  if (refused) {
    const state = t.states[refused]
    const href = refusedHref(refused, taskId)
    return (
      <PageLayout title={t.title} onBack={back} backAriaLabel={t.back}>
        <StatusCard
          title={state.title}
          body={
            refused === 'proRequired'
              ? formatMessage(state.body, {
                  proLimit: QUOTE_INVITE_LIMITS.pro.perTask,
                })
              : state.body
          }
          role={refused === 'error' ? 'alert' : undefined}
          actions={
            href ? (
              <Button asChild size="form">
                <Link href={href} _hover={{ textDecoration: 'none' }}>
                  {state.action}
                </Link>
              </Button>
            ) : (
              <Button size="form" onClick={onRetry}>
                {state.action}
              </Button>
            )
          }
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={t.title}
      description={t.description}
      onBack={back}
      backAriaLabel={t.back}
    >
      {
        // The task this list is for, over whatever follows (the Expo app the same).
        taskTitle ? (
          <Text fontWeight={500} lineClamp={2} data-find-worker-task="">
            {taskTitle}
          </Text>
        ) : null
      }
      {loading ? (
        // The rows' own shape: a round photo, two lines, the button.
        <Stack gap={0} aria-busy="true" data-find-worker-loading="">
          {LOADING_ROWS.map((key, index) => (
            <HStack
              key={key}
              gap={3}
              py={3}
              borderTopWidth={index === 0 ? 0 : '1px'}
              borderColor="border.default"
            >
              <SkeletonCircle size="10" flexShrink={0} />
              <Stack gap={2} flex={1} minW={0}>
                <Skeleton h="14px" w="40%" />
                <Skeleton h="12px" w="65%" />
              </Stack>
              <Skeleton h="36px" w="104px" borderRadius="full" flexShrink={0} />
            </HStack>
          ))}
        </Stack>
      ) : rows.length === 0 ? (
        <StatusCard
          title={t.empty.title}
          body={
            categories
              ? formatMessage(t.empty.body, { categories })
              : t.empty.bodyNoCategories
          }
          actions={
            <Button asChild size="form" variant="secondary">
              <Link href="/workers" _hover={{ textDecoration: 'none' }}>
                {t.empty.browse}
              </Link>
            </Button>
          }
        />
      ) : (
        <Stack gap={2}>
          {leftLabel ? (
            <Text
              fontSize="sm"
              color="text.muted"
              aria-live="polite"
              data-find-worker-left=""
            >
              {leftLabel}
            </Text>
          ) : null}
          <Stack
            as="ul"
            aria-label={t.listLabel}
            gap={0}
            listStyleType="none"
            m={0}
            p={0}
            data-find-worker-list=""
          >
            {rows.map((row, index) => {
              const asked =
                row.alreadyAsked || askedHere.includes(row.workerUserId)
              const busy = asking && askingId === row.workerUserId
              const rowError = askingId === row.workerUserId ? askError : null
              return (
                <Box
                  as="li"
                  key={row.workerUserId}
                  py={3}
                  borderTopWidth={index === 0 ? 0 : '1px'}
                  borderColor="border.default"
                  data-find-worker-row={asked ? 'asked' : 'open'}
                >
                  <HStack gap={3} align="center">
                    <Link
                      href={publicProfilePath(row.workerUserId, {
                        fromTask: taskId,
                      })}
                      aria-label={formatMessage(t.viewProfile, {
                        name: row.name,
                      })}
                      display="flex"
                      alignItems="center"
                      gap={3}
                      flex={1}
                      minW={0}
                      minH="44px"
                      color="text.default"
                      _hover={{ textDecoration: 'none' }}
                    >
                      <Avatar
                        name={row.name}
                        src={row.avatarUrl ?? undefined}
                        size="lg"
                      />
                      <Stack gap={0.5} flex={1} minW={0}>
                        <HStack gap={1.5} minW={0}>
                          <Text fontWeight={500} truncate>
                            {row.name}
                          </Text>
                          {row.pro ? (
                            <Badge
                              variant="premium"
                              shape="pill"
                              size="sm"
                              flexShrink={0}
                              aria-label={t.proBadgeLabel}
                            >
                              {t.proBadge}
                            </Badge>
                          ) : null}
                        </HStack>
                        <Text fontSize="sm" color="text.muted" truncate>
                          {row.matchesLabel}
                        </Text>
                        <HStack
                          // On a narrow phone the reviews go under the
                          // distance; neither is cut.
                          columnGap={2}
                          rowGap={0}
                          flexWrap="wrap"
                          color="text.muted"
                          minW={0}
                        >
                          <Text fontSize="xs">{row.distanceLabel}</Text>
                          {row.ratingLabel ? (
                            <Rating value={row.ratingLabel} size="sm" />
                          ) : null}
                        </HStack>
                      </Stack>
                    </Link>
                    {asked ? (
                      <HStack
                        gap={1}
                        flexShrink={0}
                        color="text.muted"
                        fontSize="sm"
                        fontWeight={500}
                        data-find-worker-asked=""
                      >
                        <LuCheck aria-hidden size={16} />
                        <Text as="span">{t.asked}</Text>
                      </HStack>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        flexShrink={0}
                        loading={busy}
                        disabled={asking || left === 0}
                        aria-label={formatMessage(t.askFor, {
                          name: row.firstName,
                        })}
                        onClick={() => void askRow(row)}
                      >
                        {t.ask}
                      </Button>
                    )}
                  </HStack>
                  {rowError ? (
                    <Text
                      mt={2}
                      fontSize="sm"
                      color="status.danger.fg"
                      role="alert"
                    >
                      {rowError}
                    </Text>
                  ) : null}
                </Box>
              )
            })}
          </Stack>
        </Stack>
      )}
    </PageLayout>
  )
}
