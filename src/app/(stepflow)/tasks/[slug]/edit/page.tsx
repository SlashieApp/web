'use client'

import { useQuery } from '@apollo/client/react'
import type { MeQuery, TaskForEditQuery } from '@codegen/schema'
import { useParams, useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

import { SessionLoading } from '@/app/(auth)/components/ui/SessionLoading'
import { getContactOptions } from '@/app/(dashboard)/profile/profileEligibility'
import TaskForEdit from '@/app/(task)/tasks/[slug]/graphql/TaskForEdit.gql'
import { liveQuoteCount } from '@/app/(task)/tasks/[slug]/views/getTaskDetailView'
import Me from '@/graphql/Me.gql'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { getAuthToken } from '@/utils/auth'

import { EditTaskScreen } from './components/EditTaskScreen'
import { EditTaskStatus } from './components/EditTaskStatus'
import { EDIT_TASK_VIEWS, getEditTaskView } from './views'

/** /tasks/[slug]/edit: the poster's form, or why it can't be edited. */
export default function EditTaskPage() {
  const router = useRouter()
  const localize = useLocalizedHref()
  const { slug: taskId } = useParams<{ slug: string }>()
  const [session, setSession] = useState<'guest' | 'ready' | null>(null)
  const gateRef = useRef(false)
  if (!gateRef.current) {
    gateRef.current = true
    const signedIn = Boolean(getAuthToken())
    setSession(signedIn ? 'ready' : 'guest')
    if (!signedIn) {
      router.replace(
        localize(`/login?next=${encodeURIComponent(`/tasks/${taskId}/edit`)}`),
      )
    }
  }

  const me = useQuery<MeQuery>(Me, {
    skip: session !== 'ready',
    fetchPolicy: 'cache-first',
  })
  const taskQuery = useQuery<TaskForEditQuery>(TaskForEdit, {
    variables: { id: taskId },
    skip: session !== 'ready',
    fetchPolicy: 'network-only',
  })
  const task = taskQuery.data?.task ?? null
  const meId = me.data?.me?.id
  const liveQuotes = task ? liveQuoteCount(task.quotes) : 0

  const config =
    EDIT_TASK_VIEWS[
      getEditTaskView({
        session:
          session === 'guest'
            ? 'guest'
            : session === null || (!me.data && me.loading)
              ? 'loading'
              : 'ready',
        // Without the account, "is this yours?" can't be answered either.
        query:
          (taskQuery.error && !taskQuery.data) || (me.error && !me.data)
            ? 'error'
            : taskQuery.loading && !taskQuery.data
              ? 'loading'
              : 'ready',
        task: task
          ? {
              status: task.status,
              isOwner: Boolean(meId) && task.poster?.id === meId,
              liveQuotes,
            }
          : null,
      })
    ]

  if (config.layout === 'form' && task && me.data?.me) {
    return (
      <EditTaskScreen
        task={task}
        contactOptions={getContactOptions(me.data.me)}
        liveQuotes={liveQuotes}
        quotesWarning={config.quotesWarning}
      />
    )
  }

  if (config.layout === 'status') {
    return (
      <EditTaskStatus
        config={config}
        taskId={taskId}
        onRetry={() => {
          void me.refetch()
          void taskQuery.refetch()
        }}
      />
    )
  }

  return <SessionLoading minH="50vh" />
}
