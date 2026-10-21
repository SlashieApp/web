'use client'

import { useCallback, useRef } from 'react'

import { useMessages } from '@/app/(messages)/messages/context/MessagesProvider'
import { useTaskDetail } from '@/app/(task)/tasks/[slug]/context/TaskDetailProvider'
import type { TaskDetailViewName } from '@/app/(task)/tasks/[slug]/views/types'

import { shouldRefetchThreads } from '../helpers/messagesThread'

/**
 * Keeps `thread.attention` in step with task detail, which the bottom pin
 * needs. The API works out `attention` when it sends the thread, but task
 * detail polls and moves on at the booked start with no new item, so the
 * threads are fetched again whenever its view changes (not for the first
 * view). The threads query rewrites the same cached `Thread` the open
 * conversation reads, so its `attention` follows without refetching the
 * timeline (and losing the pages loaded with Load earlier). Renders nothing;
 * mount it with the task's id as `key`, so another task's first view is not
 * a change. Runs inside the thread's `TaskDetailProvider`.
 */
export function ThreadAttentionRefresh() {
  const { view } = useTaskDetail()
  const { refetchThreads } = useMessages()
  const lastViewRef = useRef<TaskDetailViewName | null>(null)

  // A new callback runs again on the same element, so this fires as `view`
  // changes without a `useEffect`.
  const onViewRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || view === 'loading') return
      const previous = lastViewRef.current
      lastViewRef.current = view
      if (shouldRefetchThreads(previous, view)) refetchThreads()
    },
    [view, refetchThreads],
  )

  return <div ref={onViewRef} hidden aria-hidden />
}
