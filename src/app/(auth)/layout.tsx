'use client'

import { Box, Container, Stack } from '@chakra-ui/react'
import { useSelectedLayoutSegment } from 'next/navigation'
import { useCallback, useRef } from 'react'

import { LanguageSwitcher } from '@/i18n/LanguageSwitcher'
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
      <Container
        flex={1}
        display="flex"
        flexDirection="column"
        minH="100vh"
        py={{ base: 10, md: 12 }}
      >
        <Box display="flex" justifyContent="flex-end" mb={{ base: 4, md: 6 }}>
          <LanguageSwitcher />
        </Box>
        {isLoginOrRegister ? (
          children
        ) : (
          <Stack flex={1} justify="center" maxW="md" w="full" gap={8}>
            {children}
          </Stack>
        )}
      </Container>
    </Box>
  )
}
