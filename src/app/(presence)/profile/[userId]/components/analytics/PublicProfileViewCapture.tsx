'use client'

import { useCallback, useRef } from 'react'

import { useMe, useUserStore } from '@/app/(auth)/store/user'
import { captureWorkerProfileView } from '@/utils/analytics/worker-profile-view'
import { getAuthToken } from '@/utils/auth'

import type { PublicProfileView } from '../../helpers/publicProfileModel'

/** Fires worker_view once per session for a stranger looking at a worker. */
export function PublicProfileViewCapture({
  view,
}: {
  view: PublicProfileView
}) {
  const me = useMe()
  const authLoading = useUserStore((state) => state.isLoading)
  const isAuthenticated = Boolean(getAuthToken())
  const authReady = !isAuthenticated || !authLoading
  const capturedRef = useRef(false)

  const onMountRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || capturedRef.current || !authReady) return
      if (view.isSelf || !view.workerId) return
      capturedRef.current = true
      captureWorkerProfileView({
        workerId: view.workerId,
        workerUserId: view.id,
        viewerUserId: me?.id,
        isAuthenticated,
      })
    },
    [authReady, isAuthenticated, me?.id, view.id, view.isSelf, view.workerId],
  )

  return <div ref={onMountRef} hidden />
}
