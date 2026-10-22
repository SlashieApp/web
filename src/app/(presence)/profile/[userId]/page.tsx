'use client'

import { Box } from '@chakra-ui/react'
import { useParams, useSearchParams } from 'next/navigation'

import { useLocale } from '@/i18n/LocaleProvider'

import { PublicProfileScreen } from './components/PublicProfileScreen'
import { PublicProfileViewCapture } from './components/analytics/PublicProfileViewCapture'
import { toPublicProfileModel } from './helpers/publicProfileModel'
import { usePublicProfile } from './helpers/usePublicProfile'
import { usePublicProfileActions } from './helpers/usePublicProfileActions'
import { getPublicProfileView } from './views'

function routeParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

/** Public presence at `/profile/[userId]`. Anonymous OK. The view decides what shows. */
export default function PublicProfilePage() {
  const params = useParams<{ userId: string }>()
  const userId = routeParam(params.userId)
  const excludeTaskId = useSearchParams().get('excludeTaskId')?.trim() || null
  const locale = useLocale()
  const { profile, pending, error, refetch } = usePublicProfile(
    userId,
    excludeTaskId,
  )
  const model = profile ? toPublicProfileModel(profile, locale) : null
  const viewer = model?.viewer
  const view = getPublicProfileView({
    query: pending ? 'loading' : error ? 'error' : 'ready',
    profile: model
      ? {
          isSelf: model.isSelf,
          isHidden: model.isHidden,
          isWorker: model.isWorker,
          contact: viewer
            ? {
                action: viewer.contactAction,
                relatedTaskId: viewer.relatedTaskId,
              }
            : null,
        }
      : null,
  })
  const actions = usePublicProfileActions(model, excludeTaskId)

  return (
    <Box bg="bg.canvas" color="text.default" minH="100%">
      <PublicProfileScreen
        view={view}
        model={model}
        excludeTaskId={excludeTaskId}
        onRetry={() => void refetch()}
        {...actions}
      />
      {model ? <PublicProfileViewCapture model={model} /> : null}
    </Box>
  )
}
