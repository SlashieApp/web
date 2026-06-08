'use client'

import { Box } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useCallback, useRef } from 'react'

/** Legacy route — worker profile is edited on `/profile#profile-worker`. */
export default function WorkerSetupPage() {
  const router = useRouter()
  const redirectedRef = useRef(false)

  const onMount = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || redirectedRef.current) return
      redirectedRef.current = true
      router.replace('/profile#profile-worker')
    },
    [router],
  )

  return <Box ref={onMount} minH="100dvh" bg="neutral.100" aria-hidden />
}
