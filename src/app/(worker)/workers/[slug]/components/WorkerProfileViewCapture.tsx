'use client'

import { useCallback, useRef } from 'react'

import { useMe, useUserStore } from '@/app/(auth)/store/user'
import { captureWorkerProfileView } from '@/utils/analytics/worker-profile-view'
import { getAuthToken } from '@/utils/auth'

import { useWorkerProfile } from '../context/WorkerProfileContext'

type WorkerProfileViewCaptureProps = {
  source?: 'quote_card' | 'quotes_page' | 'direct'
}

/** Fires UBA worker_view once per session per worker for non-self viewers. */
export function WorkerProfileViewCapture({
  source,
}: WorkerProfileViewCaptureProps) {
  const { worker } = useWorkerProfile()
  const me = useMe()
  const authLoading = useUserStore((state) => state.isLoading)
  const isAuthenticated = Boolean(getAuthToken())
  const authReady = !isAuthenticated || !authLoading
  const capturedRef = useRef(false)

  const onMountRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || capturedRef.current || !authReady) return
      capturedRef.current = true
      captureWorkerProfileView({
        workerId: worker.id,
        workerUserId: worker.user.id,
        viewerUserId: me?.id,
        isAuthenticated,
        source,
      })
    },
    [authReady, isAuthenticated, me?.id, source, worker.id, worker.user.id],
  )

  if (!authReady) return null

  return <div ref={onMountRef} hidden aria-hidden />
}
