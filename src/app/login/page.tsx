'use client'

import { LandingHeader } from '@/app/components'
import { useMutation } from '@apollo/client/react'
import { Box, Button, Heading, Link, Stack, Text } from '@chakra-ui/react'
import type { LoginMutation } from '@codegen/schema'
import { Container, Input } from '@ui'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { LOGIN_MUTATION } from '@/graphql/auth'
import { setAuthToken } from '@/utils/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [login, { loading }] = useMutation<LoginMutation>(LOGIN_MUTATION)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      const res = await login({
        variables: { email, password },
      })

      const token = res.data?.login?.token
      if (!token) throw new Error('Missing token')

      setAuthToken(token)
      router.push('/dashboard')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed'
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
