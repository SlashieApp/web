'use client'

import { useCallback } from 'react'

import {
  captureTaskDetailView,
  resolveTaskDetailViewerRole,
} from '@/lib/analytics'

type TaskDetailViewCaptureProps = {
  taskId: string
  taskSlug: string
  isOwner: boolean
  hasWorkerProfile: boolean
  isAuthenticated: boolean
}

/** Fires UBA task_detail_viewed once per session per task after task + auth resolve. */
export function TaskDetailViewCapture({
  taskId,
  taskSlug,
  isOwner,
  hasWorkerProfile,
  isAuthenticated,
}: TaskDetailViewCaptureProps) {
  const onMountRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return
      captureTaskDetailView({
        taskId,
        taskSlug,
        viewerRole: resolveTaskDetailViewerRole({
          isOwner,
          isAuthenticated,
          hasWorkerProfile,
        }),
        isAuthenticated,
      })
    },
    [hasWorkerProfile, isAuthenticated, isOwner, taskId, taskSlug],
  )

  return <div ref={onMountRef} hidden aria-hidden />
}
