'use client'

import { Box, Stack } from '@chakra-ui/react'
import { useSelectedLayoutSegment } from 'next/navigation'

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const segment = useSelectedLayoutSegment()
  const isLoginOrRegister = segment === 'login' || segment === 'register'

  if (isLoginOrRegister) {
    return <>{children}</>
  }

  return (
    <Box
      flex={1}
      bg="neutral.100"
      display="flex"
      flexDirection="column"
      minH={{ base: '100vh', lg: 'auto' }}
      w="full"
    >
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
