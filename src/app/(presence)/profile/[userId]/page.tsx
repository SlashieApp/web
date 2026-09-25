'use client'

import { useMutation } from '@apollo/client/react'
import { Box } from '@chakra-ui/react'
import { WorkerContactAction } from '@codegen/schema'
import type { SaveWorkerMutation, UnsaveWorkerMutation } from '@codegen/schema'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import SaveWorker from '@/app/(worker)/workers/[slug]/graphql/SaveWorker.gql'
import UnsaveWorker from '@/app/(worker)/workers/[slug]/graphql/UnsaveWorker.gql'
import { publicProfilePath } from '@/app/helpers/publicProfilePath'
import { PublicUserStatus } from '@/app/user/[id]/components/ui/PublicUserStatus'
import { useLocale, useLocalizedHref } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { showAppToast } from '@/utils/appToast'
import { Footer } from '@ui'

import { PublicProfileViewCapture } from './components/analytics/PublicProfileViewCapture'
import { PublicProfileScreen } from './components/ui/PublicProfileScreen'
import {
  resolveReviewHref,
  toPublicProfileView,
} from './helpers/publicProfileModel'
import {
  usePublicProfile,
  useReviewableOrders,
} from './helpers/usePublicProfile'
import bag from './i11n.json'

function routeParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

/**
 * Public presence at `/profile/[userId]`. Anonymous OK.
 * `isSelf` adds the preview banner and `#achievements`. A null profile
 * (private, disabled, or unknown) is an empty shell with no account data.
 */
export default function PublicProfilePage() {
  const params = useParams<{ userId: string }>()
  const searchParams = useSearchParams()
  const userId = routeParam(params.userId)
  const excludeTaskId = searchParams.get('excludeTaskId')
  const t = useI11n(bag)
  const locale = useLocale()
  const router = useRouter()
  const localize = useLocalizedHref()
  const { profile, pending, error, refetch } = usePublicProfile(
    userId,
    excludeTaskId,
  )
  const view = profile ? toPublicProfileView(profile, locale) : null
  const canReview = Boolean(view?.viewer?.canLeaveReview)
  const reviewOrders = useReviewableOrders(canReview)
  const [saveOverride, setSaveOverride] = useState<boolean | null>(null)
  const [saveWorker] = useMutation<SaveWorkerMutation>(SaveWorker)
  const [unsaveWorker] = useMutation<UnsaveWorkerMutation>(UnsaveWorker)

  const saved = saveOverride ?? Boolean(view?.viewer?.isSaved)
  const reviewHref = view
    ? resolveReviewHref({
        canLeaveReview: canReview,
        profileUserId: view.id,
        relatedTaskId: reviewOrders.loading ? null : view.viewer?.relatedTaskId,
        orders: reviewOrders.orders,
      })
    : null

  const signIn = () => {
    const next = publicProfilePath(userId, { excludeTaskId })
    router.push(localize(`/login?next=${encodeURIComponent(next)}`))
  }

  const onSave = () => {
    if (!view?.workerId) return
    if (!view.viewer) {
      signIn()
      return
    }
    const next = !saved
    setSaveOverride(next)
    const mutate = next ? saveWorker : unsaveWorker
    void mutate({ variables: { workerId: view.workerId } }).catch(() => {
      setSaveOverride(!next)
      showAppToast({ title: t.saveFailed, type: 'error' })
    })
  }

  const onContact = () => {
    if (!view) return
    const action = view.viewer?.contactAction ?? WorkerContactAction.SignIn
    const taskId = view.viewer?.relatedTaskId
    const firstName = (view.name || t.fallbackName).split(/\s+/)[0]
    if (!view.viewer || action === WorkerContactAction.SignIn) {
      signIn()
      return
    }
    if (action === WorkerContactAction.OpenQuote && taskId) {
      router.push(localize(`/tasks/${taskId}#owner-quotes`))
      return
    }
    if (action === WorkerContactAction.OpenTask && taskId) {
      router.push(localize(`/tasks/${taskId}`))
      return
    }
    if (action === WorkerContactAction.None) return
    showAppToast({
      title: formatMessage(t.contactLocked, { name: firstName }),
      type: 'info',
    })
  }

  let body = (
    <PublicProfileScreen
      pending={pending}
      view={view}
      saved={saved}
      reviewHref={reviewHref}
      excludeTaskId={excludeTaskId}
      onSave={onSave}
      onContact={onContact}
    />
  )
  if (error) {
    body = (
      <PublicUserStatus
        variant="error"
        title={t.errorTitle}
        description={t.errorDescription}
        retryLabel={t.errorRetry}
        onRetry={() => {
          void refetch()
        }}
      />
    )
  } else if (!pending && !view) {
    body = (
      <PublicUserStatus
        variant="notFound"
        title={t.notFoundTitle}
        description={t.notFoundDescription}
      />
    )
  }

  return (
    <Box bg="bg.canvas" color="text.default" minH="100%">
      {body}
      {view ? <PublicProfileViewCapture view={view} /> : null}
      <Footer />
    </Box>
  )
}
