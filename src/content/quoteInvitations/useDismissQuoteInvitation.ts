'use client'

import { useMutation } from '@apollo/client/react'
import type {
  DismissQuoteInvitationMutation,
  DismissQuoteInvitationMutationVariables,
} from '@codegen/schema'
import { useCallback } from 'react'

import { useI11n } from '@/i18n/useI11n'
import { EVENTS, capture } from '@/utils/analytics'
import { showAppToast } from '@/utils/appToast'

import DismissQuoteInvitation from './graphql/DismissQuoteInvitation.gql'
import bag from './i11n.json'
import { inviteDismissedProps } from './quoteInviteEvents'

/**
 * "Not for me" (FE-507): the invited worker sets the invitation aside. Silent:
 * the customer is not told, so there is no toast on success. A failure says so
 * once, in the app's usual generic words, and the pin stays.
 */
export function useDismissQuoteInvitation() {
  const generic = useI11n(bag).errors.generic
  const [run, { loading }] = useMutation<
    DismissQuoteInvitationMutation,
    DismissQuoteInvitationMutationVariables
  >(DismissQuoteInvitation)

  const dismiss = useCallback(
    async (taskId: string): Promise<boolean> => {
      try {
        const result = await run({
          variables: { taskId },
          // The pin and the note go at once, before the task is read again.
          update: (cache) => {
            cache.modify({
              id: cache.identify({ __typename: 'Task', id: taskId }),
              fields: {
                viewerQuoteInvitation: (existing) =>
                  existing ? { ...existing, dismissed: true } : existing,
              },
            })
          },
        })
        if (!result.data?.dismissQuoteInvitation?.taskId) {
          throw new Error('dismissQuoteInvitation returned nothing')
        }
        capture(EVENTS.quote_invite_dismissed, inviteDismissedProps(taskId), {
          sendInstantly: true,
        })
        return true
      } catch {
        showAppToast({ title: generic, type: 'error' })
        return false
      }
    },
    [generic, run],
  )

  return { dismiss, loading }
}
