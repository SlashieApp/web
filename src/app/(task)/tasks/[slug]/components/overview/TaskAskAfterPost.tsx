'use client'

import { useQuery } from '@apollo/client/react'
import { useEffect, useState } from 'react'

import { AskAfterPostPrompt } from '@/content/quoteInvitations/AskAfterPostPrompt'
import {
  firstNameOf,
  shouldPromptAfterPost,
} from '@/content/quoteInvitations/askAfterPost'
import {
  parseAskWorkerParam,
  withoutAskWorkerParam,
} from '@/content/quoteInvitations/askWorkerParam'
import QuoteInviteWorker from '@/content/quoteInvitations/graphql/QuoteInviteWorker.gql'
import type {
  QuoteInviteWorkerQuery,
  QuoteInviteWorkerQueryVariables,
} from '@/content/quoteInvitations/types'
import { useAskWorkerToQuote } from '@/content/quoteInvitations/useAskWorkerToQuote'
import { useI11n } from '@/i18n/useI11n'
import { EVENTS, capture } from '@/utils/analytics'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import bag from '../../i11n.json'

/** `?askWorker=` as a valid id, or null. Browser only: the server has no address. */
function readCarriedWorker(): string | null {
  if (typeof window === 'undefined') return null
  return parseAskWorkerParam(window.location.search)
}

/**
 * Takes `?askWorker=` off the address, valid or not, so a reload does not
 * prompt again whether or not the prompt shows.
 */
function stripCarriedWorker() {
  const { search, pathname, hash } = window.location
  const rest = withoutAskWorkerParam(search)
  if (rest !== search) {
    window.history.replaceState(
      window.history.state,
      '',
      pathname + rest + hash,
    )
  }
}

/**
 * The prompt after Post a task carried a worker (FE-507), on the new task's
 * page for its owner: "Ask {name} to quote on this task?". It shows only when
 * that worker's profile says this viewer can ask. Nothing is sent without the
 * tap on "Ask {name}".
 */
export function TaskAskAfterPost() {
  const { task, permissions, refetch } = useTaskDetail()
  const fallbackName = useI11n(bag).fallbackWorker
  const [workerId] = useState(readCarriedWorker)
  useEffect(stripCarriedWorker, [])
  const [closed, setClosed] = useState(false)
  const invite = useAskWorkerToQuote()

  // Only an owner who might be prompted asks the API about the worker.
  const { data } = useQuery<
    QuoteInviteWorkerQuery,
    QuoteInviteWorkerQueryVariables
  >(QuoteInviteWorker, {
    variables: { userId: workerId ?? '' },
    skip: !workerId || !permissions.isOwner,
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  })
  const profile = data?.publicProfile ?? null
  const open =
    !closed &&
    Boolean(task) &&
    shouldPromptAfterPost({
      workerId,
      isOwner: permissions.isOwner,
      isOpen: permissions.isOpen,
      isSuspended: permissions.isSuspended,
      canAskToQuote: profile?.worker?.viewer?.canAskToQuote,
    })
  if (!task || !workerId || !open) return null
  const workerName = firstNameOf(profile?.profile.name, fallbackName)

  return (
    <AskAfterPostPrompt
      open
      workerName={workerName}
      asking={invite.loading}
      error={invite.error}
      onSkip={() => {
        capture(EVENTS.quote_invite_prompt_skipped, { task_id: task.id })
        setClosed(true)
      }}
      onAsk={async () => {
        const ok = await invite.ask({
          taskId: task.id,
          taskTitle: task.title,
          workerUserId: workerId,
          workerName,
          surface: 'after_post',
        })
        if (ok) {
          setClosed(true)
          refetch()
        }
        return ok
      }}
    />
  )
}
