'use client'

import { useQuery } from '@apollo/client/react'
import type {
  TaskWorkerMatchesQuery,
  TaskWorkerMatchesQueryVariables,
} from '@codegen/schema'
import { useParams, useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

import { SessionLoading } from '@/app/(auth)/components/ui/SessionLoading'
import { useAskWorkerToQuote } from '@/content/quoteInvitations/useAskWorkerToQuote'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { useI11n } from '@/i18n/useI11n'
import { getAuthToken } from '@/utils/auth'
import { getGraphQLErrorCode } from '@/utils/graphqlErrors'

import { FindWorkerScreen } from './components/FindWorkerScreen'
import TaskWorkerMatches from './graphql/TaskWorkerMatches.gql'
import { findWorkerState } from './helpers/findWorker'
import bag from './i11n.json'

/**
 * /tasks/[slug]/find-worker (FE-603, Slashie Pro): the workers who fit the
 * owner's open task, best first, each with Ask to quote. The API decides who
 * may see it (the owner, with Pro, on an open task) and this shows its answer.
 */
export default function FindWorkerPage() {
  const router = useRouter()
  const localize = useLocalizedHref()
  const { slug } = useParams<{ slug: string }>()
  const taskId = String(slug ?? '')
  const t = useI11n(bag)
  const { ask, loading: asking, error: askError } = useAskWorkerToQuote()
  const [session, setSession] = useState<'guest' | 'ready' | null>(null)
  const gateRef = useRef(false)
  // Browser only: the server has no session, and `router.replace` needs
  // `location`, so the server renders the loading state (FE-323).
  if (!gateRef.current && typeof window !== 'undefined') {
    gateRef.current = true
    const signedIn = Boolean(getAuthToken())
    setSession(signedIn ? 'ready' : 'guest')
    if (!signedIn) {
      router.replace(
        localize(
          `/login?next=${encodeURIComponent(`/tasks/${taskId}/find-worker`)}`,
        ),
      )
    }
  }

  const query = useQuery<
    TaskWorkerMatchesQuery,
    TaskWorkerMatchesQueryVariables
  >(TaskWorkerMatches, {
    variables: { taskId },
    skip: session !== 'ready',
    // Who can be asked changes as invitations and quotes come in.
    fetchPolicy: 'network-only',
  })

  if (session !== 'ready') return <SessionLoading minH="50vh" />

  return (
    <FindWorkerScreen
      taskId={taskId}
      loading={query.loading && !query.data}
      refused={
        query.error && !query.data
          ? findWorkerState(getGraphQLErrorCode(query.error))
          : null
      }
      task={query.data?.task ?? null}
      matches={query.data?.taskWorkerMatches ?? null}
      onRetry={() => void query.refetch()}
      asking={asking}
      askError={askError}
      onAsk={async (row) => {
        const sent = await ask({
          taskId,
          taskTitle: query.data?.task?.title?.trim() || t.taskFallback,
          workerUserId: row.workerUserId,
          workerName: row.firstName,
          surface: 'find_worker',
        })
        // Read the list and the count again: who was asked, how many are left.
        if (sent) void query.refetch()
        return sent
      }}
    />
  )
}
