'use client'

import { useCallback, useRef } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import { getAuthToken } from '@/utils/auth'

/** Refreshes `me` (including `worker.membership`) from the API once on mount. */
export function MembershipRefreshOnMount() {
  const getUser = useUserStore((s) => s.getUser)
  const refreshedRef = useRef(false)

  const onMount = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || refreshedRef.current || !getAuthToken()) return
      refreshedRef.current = true
      void getUser()
    },
    [getUser],
  )

  return <div ref={onMount} hidden aria-hidden />
}
