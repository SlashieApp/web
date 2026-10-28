'use client'

import { Box } from '@chakra-ui/react'
import { useCallback, useRef } from 'react'

import { AccountSuspendedBanner } from '@/app/(auth)/components/ui/AccountSuspendedBanner'
import { AuthShell } from '@/app/(auth)/components/ui/AuthShell'
import { markAuthSurfaceSession } from '@/utils/analytics'

/** One layout for every auth page: suspended banner, then the auth shell. */
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const markedRef = useRef(false)

  const onAuthSurfaceRef = useCallback((node: HTMLDivElement | null) => {
    if (!node || markedRef.current) return
    markedRef.current = true
    markAuthSurfaceSession()
  }, [])

  return (
    <Box
      ref={onAuthSurfaceRef}
      flex={1}
      bg="bg.canvas"
      display="flex"
      flexDirection="column"
      minH="100dvh"
      w="full"
    >
      <AccountSuspendedBanner />
      <AuthShell>{children}</AuthShell>
    </Box>
  )
}
