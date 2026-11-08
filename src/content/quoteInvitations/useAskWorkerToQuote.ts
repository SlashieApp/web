'use client'

import { useMutation } from '@apollo/client/react'
import type {
  AskWorkerToQuoteMutation,
  AskWorkerToQuoteMutationVariables,
} from '@codegen/schema'
import { useCallback, useState } from 'react'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { EVENTS, capture } from '@/utils/analytics'
import { showAppToast } from '@/utils/appToast'
import {
  getFriendlyErrorMessage,
  getGraphQLErrorCode,
} from '@/utils/graphqlErrors'

import AskWorkerToQuote from './graphql/AskWorkerToQuote.gql'
import bag from './i11n.json'
import { quoteInviteErrorKey } from './quoteInviteErrors'
import { inviteFailedProps, inviteSentProps } from './quoteInviteEvents'
import type { QuoteInviteSurface } from './types'

export type AskWorkerInput = {
  taskId: string
  taskTitle: string
  workerUserId: string
  /** First name, as the profile's button shows it. */
  workerName: string
  surface: QuoteInviteSurface
}

/**
 * Sends the invitation (`askWorkerToQuote`) and says how it went: the success
 * toast, or the error line to show in the dialog or prompt. Only a tap calls
 * `ask`; nothing here sends on its own (FE-507).
 */
export function useAskWorkerToQuote() {
  const t = useI11n(bag)
  const [run, { loading }] = useMutation<
    AskWorkerToQuoteMutation,
    AskWorkerToQuoteMutationVariables
  >(AskWorkerToQuote)
  const [error, setError] = useState<string | null>(null)

  const ask = useCallback(
    async (input: AskWorkerInput): Promise<boolean> => {
      setError(null)
      try {
        const result = await run({
          variables: {
            taskId: input.taskId,
            workerUserId: input.workerUserId,
          },
        })
        if (!result.data?.askWorkerToQuote?.taskId) {
          throw new Error('askWorkerToQuote returned nothing')
        }
        capture(EVENTS.quote_invite_sent, inviteSentProps(input), {
          sendInstantly: true,
        })
        showAppToast({
          title: formatMessage(t.toast, {
            name: input.workerName,
            task: input.taskTitle,
          }),
          type: 'success',
        })
        return true
      } catch (caught: unknown) {
        const code = getGraphQLErrorCode(caught)
        capture(EVENTS.quote_invite_failed, inviteFailedProps(code), {
          sendInstantly: true,
        })
        const key = quoteInviteErrorKey(code)
        setError(
          key
            ? formatMessage(t.errors[key], { name: input.workerName })
            : getFriendlyErrorMessage(caught, t.errors.generic),
        )
        return false
      }
    },
    [run, t],
  )

  return { ask, loading, error, clearError: () => setError(null) }
}
