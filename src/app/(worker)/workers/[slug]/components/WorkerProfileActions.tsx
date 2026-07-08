'use client'

import { useMutation } from '@apollo/client/react'
import { Box, HStack } from '@chakra-ui/react'
import type { SaveWorkerMutation, UnsaveWorkerMutation } from '@codegen/schema'
import { WorkerContactAction } from '@codegen/schema'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LuHeart } from 'react-icons/lu'

import { Button } from '@ui'

import { showAppToast } from '@/utils/appToast'

import { useWorkerProfile } from '../context/WorkerProfileContext'
import SaveWorker from '../graphql/SaveWorker.gql'
import UnsaveWorker from '../graphql/UnsaveWorker.gql'

/**
 * Hero actions: Save (heart) + Leave a review, driven by BE-36
 * `worker.viewer` (null for anonymous visitors — those get a sign-in prompt).
 * Save toggles optimistically and rolls back if the mutation fails. The
 * review button reflects `canLeaveReview`; the submission flow itself ships
 * with the reviews stage, so an eligible click is a friendly stub for now.
 */
export function WorkerProfileActions() {
  const router = useRouter()
  const { worker } = useWorkerProfile()
  const viewer = worker.viewer ?? null
  const isOwnProfile = viewer?.contactAction === WorkerContactAction.None

  const [saved, setSaved] = useState(viewer?.isSaved ?? false)
  const [saveWorker] = useMutation<SaveWorkerMutation>(SaveWorker)
  const [unsaveWorker] = useMutation<UnsaveWorkerMutation>(UnsaveWorker)

  const onSave = async () => {
    if (!viewer) {
      router.push(`/login?next=${encodeURIComponent(`/workers/${worker.id}`)}`)
      return
    }
    const next = !saved
    setSaved(next)
    try {
      const mutate = next ? saveWorker : unsaveWorker
      await mutate({ variables: { workerId: worker.id } })
    } catch {
      // Optimistic rollback — leave the heart as it really is on the server.
      setSaved(!next)
      showAppToast({
        title: next ? 'Could not save worker' : 'Could not remove save',
        description: 'Something went wrong. Please try again.',
        type: 'error',
      })
    }
  }

  const canLeaveReview = viewer?.canLeaveReview ?? false

  const onLeaveReview = () => {
    // Eligible per BE-36, but the review submission flow ships with the
    // reviews stage — keep the button honest until then.
    showAppToast({
      title: 'Reviews are almost here',
      description:
        'You have a completed job with this worker — review writing is coming soon.',
      type: 'info',
    })
  }

  return (
    <HStack gap={2} flexWrap="wrap">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onSave}
        disabled={isOwnProfile}
        title={isOwnProfile ? 'You cannot save your own profile.' : undefined}
        aria-pressed={saved}
        aria-label={saved ? 'Remove saved worker' : 'Save this worker'}
        color={saved ? 'text.link' : undefined}
      >
        <Box as="span" display="inline-flex" aria-hidden>
          <LuHeart
            size={15}
            strokeWidth={2.2}
            fill={saved ? 'currentColor' : 'none'}
          />
        </Box>
        {saved ? 'Saved' : 'Save'}
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={!canLeaveReview}
        onClick={canLeaveReview ? onLeaveReview : undefined}
        color={canLeaveReview ? 'text.link' : undefined}
        title={
          canLeaveReview
            ? undefined
            : 'You can review a worker after completing a job with them.'
        }
      >
        Leave a review
      </Button>
    </HStack>
  )
}
