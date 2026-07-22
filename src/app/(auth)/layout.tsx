'use client'

import { Box, Stack } from '@chakra-ui/react'
import { useSelectedLayoutSegment } from 'next/navigation'
import { useCallback, useRef } from 'react'

import { LanguageSwitcher } from '@/components/LanguageSwitcher'
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
  const languageBar = (
    <Box position="absolute" top={4} right={4} zIndex={10}>
      <LanguageSwitcher />
    </Box>
  )

  if (isLoginOrRegister) {
    return (
      <Box ref={onAuthSurfaceRef} w="full" minH="100vh" position="relative">
        {languageBar}
        {children}
      </Box>
    )
  }

  return (
    <Box
      ref={onAuthSurfaceRef}
      flex={1}
      bg="bg.subtle"
      display="flex"
      flexDirection="column"
      minH={{ base: '100vh', lg: 'auto' }}
      w="full"
      position="relative"
    >
      {languageBar}
      <Stack
        flex={1}
        justify="center"
        px={{ base: 6, md: 10, xl: 16 }}
        py={{ base: 10, md: 12 }}
        maxW="md"
        w="full"
        mx="auto"
        gap={8}
      >
        {children}
      </Stack>
    </Box>
  )
}
