'use client'

import { Box, HStack, Stack } from '@chakra-ui/react'
import { useSelectedLayoutSegment } from 'next/navigation'

import { LoginMarketingPanel } from './components/LoginMarketingPanel'
import { RegisterMarketingPanel } from './components/RegisterMarketingPanel'

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const segment = useSelectedLayoutSegment()
  const isRegister = segment === 'register'

  return (
    <HStack align="stretch" gap={0} minH="100vh" w="full">
      {isRegister ? <RegisterMarketingPanel /> : <LoginMarketingPanel />}

      <Box
        flex={1}
        bg="surfaceContainerLowest"
        display="flex"
        flexDirection="column"
        minH={{ base: '100vh', lg: 'auto' }}
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
    </HStack>
  )
}
