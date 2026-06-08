'use client'

import { useCallback, useRef } from 'react'

import {
  captureTaskDetailView,
  resolveTaskDetailViewerRole,
} from '@/utils/analytics'

type TaskDetailViewCaptureProps = {
  taskId: string
  taskSlug: string
  isOwner: boolean
  hasWorkerProfile: boolean
  isAuthenticated: boolean
}

/** Fires UBA task_view once per session per task after task + auth resolve. */
export function TaskDetailViewCapture({
  taskId,
  taskSlug,
  isOwner,
  hasWorkerProfile,
  isAuthenticated,
}: TaskDetailViewCaptureProps) {
  const capturedRef = useRef(false)

  const onMountRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || capturedRef.current) return
      capturedRef.current = true
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
