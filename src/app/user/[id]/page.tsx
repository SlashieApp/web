'use client'

import { Box } from '@chakra-ui/react'
import { useParams, useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'

import { useLocale } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Footer } from '@ui'

import { workerProfilePath } from '@/app/(worker)/workers/[slug]/helpers/workerProfileHelpers'

import { PublicUserHero } from './components/ui/PublicUserHero'
import { PublicUserOpenTasks } from './components/ui/PublicUserOpenTasks'
import { PublicUserStatus } from './components/ui/PublicUserStatus'
import {
  formatPublicMemberSince,
  publicUserDisplayName,
  toPublicUserTaskCard,
} from './helpers/publicUserHelpers'
import { usePublicUser } from './helpers/usePublicUser'
import bag from './i11n.json'

function routeParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

/**
 * Public user profile (`user(id)`). Works for guests and signed-in viewers.
 * `excludeTaskId` drops the task the viewer just came from.
 */
export default function PublicUserPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const userId = routeParam(params.id)
  const excludeTaskId = searchParams.get('excludeTaskId')
  const t = useI11n(bag)
  const locale = useLocale()
  const { user, pending, error, refetch } = usePublicUser(userId, excludeTaskId)

  let body: ReactNode
  if (error) {
    body = (
      <PublicUserStatus
        variant="error"
        title={t.errorTitle}
        description={t.errorDescription}
        retryLabel={t.errorRetry}
        onRetry={refetch}
      />
    )
  } else if (!pending && !user) {
    body = (
      <PublicUserStatus
        variant="notFound"
        title={t.notFoundTitle}
        description={t.notFoundDescription}
      />
    )
  } else {
    const name = user ? publicUserDisplayName(user, t.fallbackName) : ''
    const memberSince = user
      ? formatPublicMemberSince(user.memberSince ?? user.createdAt, locale)
      : null
    const count = user?.openTaskCount ?? 0
    const countLabel =
      count === 1
        ? t.openTasksCountOne
        : formatMessage(t.openTasksCountMany, { count })
    const workerId = user?.worker?.id
    body = (
      <>
        <PublicUserHero
          pending={pending}
          name={name}
          avatarUrl={user?.profile.avatarUrl}
          memberSinceLabel={
            memberSince
              ? formatMessage(t.memberSince, { date: memberSince })
              : null
          }
          workerHref={workerId ? workerProfilePath(workerId) : null}
          workerCtaLabel={t.viewWorkerProfile}
        />
        <PublicUserOpenTasks
          pending={pending}
          heading={t.openTasksHeading}
          countLabel={countLabel}
          emptyLabel={
            excludeTaskId?.trim() ? t.openTasksEmptyOther : t.openTasksEmpty
          }
          viewTaskLabel={t.viewTask}
          tasks={user ? user.openTasks.map(toPublicUserTaskCard) : []}
        />
      </>
    )
  }

  return (
    <Box bg="bg.canvas" color="text.default" minH="100%">
      {body}
      <Footer />
    </Box>
  )
}
