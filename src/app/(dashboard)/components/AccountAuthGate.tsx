'use client'

import { Box } from '@chakra-ui/react'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import { getAuthToken } from '@/utils/auth'

type AccountAuthGateProps = {
  children: React.ReactNode
}

/**
 * Auth-gates the merged dashboard. Hydrates Zustand `me` on first mount via a
 * callback ref (no useEffect). Unauthenticated users are sent to
 * `/login?redirect=<current path>` instead of an inline sign-in panel.
 */
export function AccountAuthGate({ children }: AccountAuthGateProps) {
  const me = useUserStore((s) => s.me)
  const isLoading = useUserStore((s) => s.isLoading)
  const getUser = useUserStore((s) => s.getUser)
  const pathname = usePathname()
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
    return <Box ref={onMount} minH="100dvh" bg="bg.subtle" />
  }

  if (!me) {
    const redirectPath = pathname?.startsWith('/') ? pathname : '/dashboard'
    if (!redirectedRef.current) {
      redirectedRef.current = true
      router.replace(`/login?redirect=${encodeURIComponent(redirectPath)}`)
    }
    return <Box ref={onMount} minH="100dvh" bg="bg.subtle" />
  }

  return <Box ref={onMount}>{children}</Box>
}
