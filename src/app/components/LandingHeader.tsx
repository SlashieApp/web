'use client'

import { useApolloClient, useQuery } from '@apollo/client/react'
import { Box, HStack, Heading, Link, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'

import { ME_QUERY } from '@/graphql/auth'
import { Button } from '@/ui/Button/Button'
import { clearAuthToken, getAuthToken } from '@/utils/auth'
import type { MeQuery } from '@codegen/schema'

const navLinks = [{ label: 'Tasks', href: '/tasks' }]

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
      gap={{ base: 4, md: 8 }}
    >
      <HStack gap={3}>
        <Box w="36px" h="36px" borderRadius="12px" bg="mustard.400" />
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
            _hover={{ textDecoration: 'none', color: 'linkBlue.700' }}
          >
            {link.label}
          </Link>
        ))}
        {isAuthenticated || isCheckingSession ? (
          <>
            <Button as={NextLink} href="/dashboard" variant="ghost">
              Account
            </Button>
            <Button variant="outline" onClick={onLogout}>
              Log out
            </Button>
          </>
        ) : (
          <>
            <Button as={NextLink} href="/login" variant="ghost">
              Log in
            </Button>
            <Button as={NextLink} href="/register" variant="outline">
              Register
            </Button>
          </>
        )}
        <Button
          as={NextLink}
          href="/tasks/create"
          background="linkBlue.600"
          color="white"
        >
          Post a job
        </Button>
      </HStack>
    </Stack>
  )
}
