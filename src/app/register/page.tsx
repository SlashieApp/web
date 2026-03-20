'use client'

import { useMutation } from '@apollo/client/react'
import { Box, Link, Stack } from '@chakra-ui/react'
import type { RegisterMutation } from '@codegen/schema'
import { Button, Container, Header, Heading, Input, Text } from '@ui'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LandingHeader } from '../components'

import { REGISTER_MUTATION } from '@/graphql/auth'
import { setAuthToken } from '@/utils/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [nextPath, setNextPath] = useState('/dashboard')

  const [register, { loading }] =
    useMutation<RegisterMutation>(REGISTER_MUTATION)

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      const res = await register({
        variables: { email, password },
      })

      const token = res.data?.register?.token
      if (!token) {
        throw new Error(
          'Registration succeeded but no session token was returned.',
        )
      }

      setAuthToken(token)
      router.push(nextPath)
    } catch (err: unknown) {
      const message = getFriendlyErrorMessage(err, 'Registration failed')
      setError(message)
    }
  }

  return (
    <Box bg="bg" color="fg" minH="100vh" py={{ base: 8, md: 12 }}>
      <Container>
        <Stack gap={10}>
          <Header>
            <LandingHeader />
          </Header>
          <Box maxW="md">
            <Stack gap={6}>
              <Box>
                <Heading size="lg">Create account</Heading>
                <Text opacity={0.8} mt={2}>
                  Register to start posting jobs.
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

                  <Button type="submit" loading={loading}>
                    Register
                  </Button>
                </Stack>
              </Box>

              <Text fontSize="sm" opacity={0.85}>
                Already have an account?{' '}
                <Link as={NextLink} href="/login" textDecoration="underline">
                  Log in
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
