'use client'

import { useApolloClient, useQuery } from '@apollo/client/react'
import { Box, HStack, Link, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'

import { ME_QUERY } from '@/graphql/auth'
import { Button, Heading } from '@ui'
import { clearAuthToken, getAuthToken } from '@/utils/auth'
import type { MeQuery } from '@codegen/schema'

const navLinks = [
  { label: 'Tasks', href: '/tasks' },
  { label: 'Stitch Preview', href: '/stitch-preview' },
]

export function LandingHeader() {
  const apolloClient = useApolloClient()
  const hasToken = Boolean(getAuthToken())
  const { data, loading } = useQuery<MeQuery>(ME_QUERY, {
    skip: !hasToken,
    fetchPolicy: 'network-only',
  })
  const isAuthenticated = Boolean(data?.me)
  const isCheckingSession = hasToken && loading && !isAuthenticated

  function onLogout() {
    clearAuthToken()
    void apolloClient.clearStore()
  }

  return (
    <Stack
      direction={{ base: 'column', md: 'row' }}
      justify="space-between"
      align={{ base: 'flex-start', md: 'center' }}
      gap={{ base: 4, md: 6 }}
      py={2}
    >
      <HStack gap={3}>
        <Box
          w="36px"
          h="36px"
          borderRadius="12px"
          bg="linear-gradient(130deg, #003fb1 0%, #1a56db 100%)"
        />
        <Heading size="md">
          <Link as={NextLink} href="/" _hover={{ textDecoration: 'none' }}>
            HandyBox
          </Link>
        </Heading>
      </HStack>

      <HStack gap={3} flexWrap="wrap">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            as={NextLink}
            href={link.href}
            fontWeight={600}
            _hover={{ textDecoration: 'none', color: 'primary.600' }}
          >
            {link.label}
          </Link>
        ))}
        {isAuthenticated || isCheckingSession ? (
          <>
            <Button as={NextLink} href="/dashboard" variant="ghost">
              Account
            </Button>
            <Button variant="subtle" bg="surfaceContainerLow" onClick={onLogout}>
              Log out
            </Button>
          </>
        ) : (
          <>
            <Button as={NextLink} href="/login" variant="ghost">
              Log in
            </Button>
            <Button
              as={NextLink}
              href="/register"
              variant="subtle"
              bg="surfaceContainerLow"
            >
              Register
            </Button>
          </>
        )}
        <Button as={NextLink} href="/tasks/create" size="sm">
          Post a job
        </Button>
      </HStack>
    </Stack>
  )
}
