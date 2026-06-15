'use client'

import type { ReactNode } from 'react'

import { Box } from '@chakra-ui/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import { getAuthToken } from '@/utils/auth'

type WorkerSetupAuthGateProps = {
  children: ReactNode
}

export function WorkerSetupAuthGate({ children }: WorkerSetupAuthGateProps) {
  const me = useUserStore((s) => s.me)
  const isLoading = useUserStore((s) => s.isLoading)
  const getUser = useUserStore((s) => s.getUser)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [hydrated, setHydrated] = useState(false)
  const [hasToken, setHasToken] = useState<boolean | null>(null)
  const redirectedRef = useRef(false)

  const onMount = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || hydrated) return
      setHydrated(true)
      const token = getAuthToken()
      setHasToken(Boolean(token))
      if (token) void getUser()
    },
    [getUser, hydrated],
  )

  if (!hydrated || (hasToken && !me && isLoading)) {
    return <Box ref={onMount} minH="100dvh" bg="neutral.100" />
  }

  if (!me) {
    const query = searchParams.toString()
    const returnPath = query ? `${pathname}?${query}` : pathname
    if (!redirectedRef.current) {
      redirectedRef.current = true
      router.replace(
        `/login?next=${encodeURIComponent(returnPath ?? '/worker/setup')}`,
      )
    }
    return <Box ref={onMount} minH="100dvh" bg="neutral.100" />
  }

  return <Box ref={onMount}>{children}</Box>
}
