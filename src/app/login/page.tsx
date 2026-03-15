'use client'

import { LandingHeader } from '@/app/components'
import { ME_QUERY } from '@/graphql/auth'
import { useMutation } from '@apollo/client/react'
import { Box, Button, Heading, Link, Stack, Text } from '@chakra-ui/react'
import type { LoginMutation, MeQuery } from '@codegen/schema'
import { Container, Input } from '@ui'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { LOGIN_MUTATION } from '@/graphql/auth'
import { getAuthToken, setAuthToken } from '@/utils/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { useQuery } from '@apollo/client/react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [nextPath, setNextPath] = useState('/dashboard')

  const hasAuthToken = Boolean(getAuthToken())
  const { data: meData } = useQuery<MeQuery>(ME_QUERY, {
    skip: !hasAuthToken,
    fetchPolicy: 'network-only',
  })
  const [login, { loading }] = useMutation<LoginMutation>(LOGIN_MUTATION)

  useEffect(() => {
    const requestedNextPath = new URLSearchParams(window.location.search).get(
      'next',
    )
    const hasSafeNextPath =
      requestedNextPath?.startsWith('/') && !requestedNextPath.startsWith('//')

    if (hasSafeNextPath && requestedNextPath) {
      setNextPath(requestedNextPath)
    }
  }, [])

  useEffect(() => {
    if (!meData?.me) return
    router.replace(nextPath)
  }, [meData?.me, nextPath, router])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      const res = await login({
        variables: { email, password },
      })

      const token = res.data?.login?.token
      if (!token) {
        throw new Error('Login succeeded but no session token was returned.')
      }

      setAuthToken(token)
      router.push(nextPath)
    } catch (err: unknown) {
      const message = getFriendlyErrorMessage(err, 'Login failed')
      setError(message)
    }
  }

  return (
    <Box bg="bg" color="fg" minH="100vh" py={{ base: 8, md: 12 }}>
      <Container>
        <Stack gap={10}>
          <LandingHeader />
          <Box maxW="md">
            <Stack gap={6}>
              <Box>
                <Heading size="lg">Log in</Heading>
                <Text opacity={0.8} mt={2}>
                  Use your account to post jobs and manage requests.
                </Text>
              </Box>

              <Box as="form" onSubmit={onSubmit}>
                <Stack gap={3}>
                  <Input
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                  />
                  <Input
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    required
                  />

                  {error ? (
                    <Text color="red.400" fontSize="sm">
                      {error}
                    </Text>
                  ) : null}

                  <Button type="submit" loading={loading} colorPalette="blue">
                    Log in
                  </Button>
                </Stack>
              </Box>

              <Text fontSize="sm" opacity={0.85}>
                Don’t have an account?{' '}
                <Link as={NextLink} href="/register" textDecoration="underline">
                  Register
                </Link>
              </Text>
              <Text fontSize="sm" opacity={0.85}>
                Forgot your password?{' '}
                <Link
                  as={NextLink}
                  href="/forgot-password"
                  textDecoration="underline"
                >
                  Reset it
                </Link>
              </Text>
              <Link
                as={NextLink}
                href="/"
                fontSize="sm"
                color="muted"
                _hover={{ color: 'fg' }}
              >
                ← Back to home
              </Link>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}
