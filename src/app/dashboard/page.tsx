'use client'

import { useQuery } from '@apollo/client/react'
import { Box, Button, Heading, Link, Stack, Text } from '@chakra-ui/react'
import type { MeQuery } from '@codegen/schema'
import { Container } from '@ui'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { LandingHeader } from '../components'

import { ME_QUERY } from '@/graphql/auth'
import { clearAuthToken } from '@/utils/auth'

export default function DashboardPage() {
  const router = useRouter()
  const { data, loading, error, refetch } = useQuery<MeQuery>(ME_QUERY, {
    fetchPolicy: 'network-only',
  })

  const me = data?.me ?? null

  return (
    <Box bg="bg" color="fg" minH="100vh" py={{ base: 8, md: 12 }}>
      <Container>
        <Stack gap={10}>
          <LandingHeader />
          <Box maxW="md">
            <Stack gap={6}>
              <Box>
                <Heading size="lg">Dashboard</Heading>
                <Text opacity={0.8} mt={2}>
                  Auth check using <code>me</code> query.
                </Text>
              </Box>

              {loading ? <Text>Loading…</Text> : null}
              {error ? (
                <Text color="red.400" fontSize="sm">
                  {error.message}
                </Text>
              ) : null}

              {me ? (
                <Box borderWidth="1px" borderRadius="lg" p={4}>
                  <Text fontWeight="600">Signed in as</Text>
                  <Text>{me.email}</Text>
                </Box>
              ) : (
                !loading && (
                  <Text opacity={0.8}>
                    Not signed in (or token invalid). Try logging in.
                  </Text>
                )
              )}

              <Stack direction="row" gap={3}>
                <Button
                  onClick={() => {
                    clearAuthToken()
                    router.push('/login')
                  }}
                  variant="outline"
                >
                  Log out
                </Button>
                <Button onClick={() => refetch()} colorPalette="blue">
                  Refresh
                </Button>
              </Stack>
              <Link
                as={NextLink}
                href="/"
                fontSize="sm"
                color="muted"
                _hover={{ color: 'fg' }}
              >
                ← Back to home
              </Link>
              <Link
                as={NextLink}
                href="/tasks"
                fontSize="sm"
                color="muted"
                _hover={{ color: 'fg' }}
              >
                Browse tasks →
              </Link>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}
