'use client'

import { useMutation } from '@apollo/client/react'
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { REGISTER_MUTATION } from '@/graphql/auth'
import { setAuthToken } from '@/utils/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [register, { loading }] = useMutation<{
    register: { token: string; user: { id: string; email: string } }
  }>(REGISTER_MUTATION)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    try {
      const res = await register({
        variables: { email, password },
      })

      const token = res.data?.register?.token
      if (!token) throw new Error('Missing token')

      setAuthToken(token)
      router.push('/dashboard')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      setError(message)
    }
  }

  return (
    <Container maxW="md" py={12}>
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

            <Button type="submit" loading={loading} colorPalette="green">
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
      </Stack>
    </Container>
  )
}
