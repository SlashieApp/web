'use client'

import { useQuery } from '@apollo/client/react'
import {
  Box,
  Button,
  Container,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

import { ME_QUERY } from '@/graphql/auth'
import { clearAuthToken } from '@/utils/auth'

export default function DashboardPage() {
  const router = useRouter()
  const { data, loading, error, refetch } = useQuery<{
    me: { id: string; email: string; createdAt: string } | null
  }>(ME_QUERY, {
    fetchPolicy: 'network-only',
  })

  const me = data?.me ?? null

  return (
    <Container maxW="md" py={12}>
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
      </Stack>
    </Container>
  )
}
