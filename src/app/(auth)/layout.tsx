'use client'

import { Box, Container, Stack } from '@chakra-ui/react'
import { useSelectedLayoutSegment } from 'next/navigation'
import { useCallback, useRef } from 'react'

import { AccountSuspendedBanner } from '@/app/(auth)/components/ui/AccountSuspendedBanner'
import { markAuthSurfaceSession } from '@/utils/analytics'

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const segment = useSelectedLayoutSegment()
  const isLoginOrRegister = segment === 'login' || segment === 'register'
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
      bg="bg.subtle"
      display="flex"
      flexDirection="column"
      minH="100vh"
      w="full"
    >
      <AccountSuspendedBanner />
      <Container
        flex={1}
        display="flex"
        flexDirection="column"
        minH="100vh"
        py={{ base: 10, md: 12 }}
        overflow="visible"
      >
        <Box as="main" flex={1} minW={0} overflowX="clip">
          {isLoginOrRegister ? (
            children
          ) : (
            <Stack flex={1} justify="center" maxW="md" w="full" gap={8}>
              {children}
            </Stack>
          )}
        </Box>
      </Container>
    </Box>
  )
}
