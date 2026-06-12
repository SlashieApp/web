'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useRef } from 'react'

export function WorkerPlanRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectedRef = useRef(false)

  const onMount = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || redirectedRef.current) return
      redirectedRef.current = true
      const qs = searchParams.toString()
      router.replace(qs ? `/billing?${qs}` : '/billing')
    },
    [router, searchParams],
  )

  return <div ref={onMount} hidden aria-hidden />
}
