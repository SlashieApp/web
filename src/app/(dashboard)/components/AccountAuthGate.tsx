'use client'

import { Box, Container, Heading, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import { getAuthToken } from '@/utils/auth'
import { Button } from '@ui'

type AccountAuthGateProps = {
  children: React.ReactNode
}

/**
 * Auth-gates the merged dashboard. Hydrates Zustand `me` snapshot from the
 * `me` query on first mount via a callback ref (no useEffect), and renders a
 * sign-in panel when no token / no me is available.
 */
export function AccountAuthGate({ children }: AccountAuthGateProps) {
  const me = useUserStore((s) => s.me)
  const isLoading = useUserStore((s) => s.isLoading)
  const getUser = useUserStore((s) => s.getUser)
  const pathname = usePathname()
  const [hydrated, setHydrated] = useState(false)
  const [hasToken, setHasToken] = useState<boolean | null>(null)

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
    const next = pathname?.startsWith('/') ? pathname : '/dashboard'
    const loginHref = `/login?next=${encodeURIComponent(next)}`
    return (
      <Box ref={onMount} bg="neutral.100" color="cardFg" minH="100dvh">
        <Container maxW="md" pt={{ base: 12, md: 24 }} px={4}>
          <Stack
            gap={4}
            p={8}
            borderRadius="xl"
            bg="cardBg"
            borderWidth="1px"
            borderColor="cardBorder"
          >
            <Heading size="lg">Sign in to your account</Heading>
            <Text color="formLabelMuted">
              Your dashboard combines posted requests, active jobs, earnings,
              and worker setup in one workspace.
            </Text>
            <Stack gap={3}>
              <Link
                as={NextLink}
                href={loginHref}
                _hover={{ textDecoration: 'none' }}
              >
                <Button w="full">Log in</Button>
              </Link>
              <Link
                as={NextLink}
                href="/register"
                _hover={{ textDecoration: 'none' }}
              >
                <Button w="full" variant="ghost">
                  Create account
                </Button>
              </Link>
            </Stack>
          </Stack>
        </Container>
      </Box>
    )
  }

  return <Box ref={onMount}>{children}</Box>
}
