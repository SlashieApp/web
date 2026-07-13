'use client'

import { Box } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

import { MobileCarousel } from '@ui'

import { useWorkerSearch } from '../context/WorkerSearchProvider'
import {
  workerAvatarUrl,
  workerDisplayName,
  workerExperienceShortLabel,
  workerRatingLabel,
  workerRespondsLabel,
  workerServiceAreaLabel,
  workerSubtitle,
} from '../helpers/workerSearchHelpers'
import { WorkerSearchCard } from './WorkerSearchCard'
import { WorkerSearchEmptyState } from './WorkerSearchEmptyState'

/**
 * Mobile bottom strip for worker mode: same center-snapping behaviour as the
 * task carousel (shared `MobileCarousel` mechanics). Swiping highlights the
 * matching person pin; tapping the centered card opens the worker's profile.
 */
export function MobileWorkerCarousel() {
  const router = useRouter()
  const {
    workers,
    canShowWorkersEmptyState,
    selectedWorkerId,
    setSelectedWorkerId,
  } = useWorkerSearch()

  if (workers.length === 0) {
    if (!canShowWorkersEmptyState) return null
    return (
      <Box px={{ base: 2, md: 3 }} pb={2} pointerEvents="auto">
        <WorkerSearchEmptyState />
      </Box>
    )
  }

  return (
    <MobileCarousel
      items={workers}
      selectedId={selectedWorkerId}
      onSnapSelect={setSelectedWorkerId}
      onActivateCentered={(workerId) => router.push(`/workers/${workerId}`)}
    >
      {(worker, state) => {
        const name = workerDisplayName(worker)
        return (
          <WorkerSearchCard
            compact
            activateMode="gesture"
            activateCursor={state.activateCursor}
            name={name}
            avatarUrl={workerAvatarUrl(worker)}
            verified={worker.isVerified}
            subtitle={workerSubtitle(worker)}
            ratingLabel={workerRatingLabel(worker)}
            experienceLabel={workerExperienceShortLabel(worker)}
            respondsLabel={workerRespondsLabel(worker)}
            serviceAreaLabel={workerServiceAreaLabel(worker)}
            skills={worker.skills}
            profileHref={`/workers/${worker.id}`}
            isActive={state.isActive}
            activateAriaLabel={
              state.isPeekAdjacent
                ? `${name}. Show ${state.peekDirection === 'next' ? 'next' : 'previous'} worker.`
                : `${name}. Open profile.`
            }
            onActivate={state.activate}
          />
        )
      }}
    </MobileCarousel>
  )
}
