'use client'

import { WorkerContactAction } from '@codegen/schema'
import { useRouter } from 'next/navigation'

import { Button } from '@ui'

import { showAppToast } from '@/utils/appToast'

import { useWorkerProfile } from '../../context/WorkerProfileContext'
import { workerFirstName } from '../../helpers/workerProfileHelpers'

/**
 * "Contact {firstName}" CTA, routed by BE-36 `viewer.contactAction`:
 * - SIGN_IN (or anonymous `viewer: null`) → sign-in with return path
 * - OPEN_QUOTE → the viewer's task where this worker has a pending quote
 * - OPEN_TASK → the active job's task detail
 * - ACCEPT_QUOTE_FIRST → explainer (details unlock via the task flow)
 * - NONE → own profile, button disabled
 * Contact details are never shown on the profile itself.
 */
export function WorkerContactButton({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const router = useRouter()
  const { worker } = useWorkerProfile()
  const firstName = workerFirstName(worker)
  const viewer = worker.viewer ?? null
  const action = viewer?.contactAction ?? WorkerContactAction.SignIn
  const isOwnProfile = action === WorkerContactAction.None

  const onContact = () => {
    switch (action) {
      case WorkerContactAction.SignIn:
        router.push(
          `/login?next=${encodeURIComponent(`/workers/${worker.id}`)}`,
        )
        return
      case WorkerContactAction.OpenQuote: {
        const taskId = viewer?.relatedTaskId
        if (taskId) {
          router.push(`/tasks/${taskId}#owner-quotes`)
          return
        }
        break
      }
      case WorkerContactAction.OpenTask: {
        const taskId = viewer?.relatedTaskId
        if (taskId) {
          router.push(`/tasks/${taskId}`)
          return
        }
        break
      }
      default:
        break
    }
    // ACCEPT_QUOTE_FIRST (and any missing related ids): explain the unlock.
    showAppToast({
      title: `Contact ${firstName} through a task`,
      description: `Post a task and accept ${firstName}'s quote — contact details unlock when a quote is accepted.`,
      type: 'info',
      duration: 6000,
    })
  }

  return (
    <Button
      type="button"
      w="full"
      size={size}
      onClick={onContact}
      disabled={isOwnProfile}
      title={isOwnProfile ? 'This is your profile.' : undefined}
    >
      Contact {firstName}
    </Button>
  )
}
