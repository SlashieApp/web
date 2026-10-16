'use client'

import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

import { SessionLoading } from '@/app/(auth)/components/ui/SessionLoading'
import { useUserStore } from '@/app/(auth)/store/user'
import { useI11n } from '@/i18n/useI11n'
import { getAuthToken } from '@/utils/auth'
import { Button } from '@ui'

import bag from '../../i11n.json'

type AccountAuthGateProps = {
  children: React.ReactNode
}

/** `me` failed but the session is still there: say so instead of logging out. */
export function SessionError({
  onRetry,
  onLogout,
}: {
  onRetry: () => void
  onLogout: () => void
}) {
  const t = useI11n(bag).session

  return (
    <Stack
      role="alert"
      minH="100dvh"
      align="center"
      justify="center"
      gap={4}
      px={4}
      textAlign="center"
      bg="bg.canvas"
    >
      <Heading as="h1" fontSize="xl" color="text.default">
        {t.errorTitle}
      </Heading>
      <Text color="text.muted" maxW="22rem">
        {t.errorBody}
      </Text>
      <Stack
        direction={{ base: 'column', sm: 'row' }}
        gap={2}
        w={{ base: 'full', sm: 'auto' }}
        maxW="22rem"
      >
        <Button type="button" onClick={onRetry}>
          {t.retry}
        </Button>
        <Button type="button" variant="ghost" onClick={onLogout}>
          {t.logout}
        </Button>
      </Stack>
    </Stack>
  )
}

/**
 * Auth-gates the merged dashboard. Hydrates Zustand `me` on first mount via a
 * callback ref (no useEffect). Unauthenticated users are sent to
 * `/login?next=<current path>` instead of an inline sign-in panel. When `me`
 * fails but the token survived (network or server trouble), it offers Try
 * again rather than a sign-in.
 */
export function AccountAuthGate({ children }: AccountAuthGateProps) {
  const me = useUserStore((s) => s.me)
  const isLoading = useUserStore((s) => s.isLoading)
  const getUser = useUserStore((s) => s.getUser)
  const logout = useUserStore((s) => s.logout)
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
    return <SessionLoading ref={onMount} />
  }

  if (!me) {
    if (hasToken && getAuthToken()) {
      return <SessionError onRetry={() => void getUser()} onLogout={logout} />
    }
    const redirectPath = pathname?.startsWith('/') ? pathname : '/tasks'
    if (!redirectedRef.current) {
      redirectedRef.current = true
      router.replace(`/login?next=${encodeURIComponent(redirectPath)}`)
    }
    return <SessionLoading ref={onMount} />
  }

  return <Box ref={onMount}>{children}</Box>
}
