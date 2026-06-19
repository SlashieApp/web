'use client'

import { Box, HStack, Heading, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'

import { useUserStore } from '@/app/(auth)/store/user'
import { Button, Card } from '@ui'

import { MembershipRefreshOnMount } from '../components/MembershipRefreshOnMount'
import { WorkerMembershipCard } from '../components/WorkerMembershipCard'
import { AccountContactCard } from './components/AccountContactCard'
import { AccountSettingsCard } from './components/AccountSettingsCard'

function Row({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <HStack justify="space-between" align="flex-start" gap={4} flexWrap="wrap">
      <Stack gap={0}>
        <Text fontSize="sm" fontWeight={700}>
          {label}
        </Text>
        {hint ? (
          <Text fontSize="xs" color="formLabelMuted">
            {hint}
          </Text>
        ) : null}
      </Stack>
      <Text fontSize="sm" color="formLabelMuted">
        {value}
      </Text>
    </HStack>
  )
}

export default function AccountPage() {
  const router = useRouter()
  const me = useUserStore((s) => s.me)
  const logout = useUserStore((s) => s.logout)

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!me) return null

  const enabledMethods = me.enabledLoginMethods?.length
    ? me.enabledLoginMethods.join(', ')
    : 'Password'

  return (
    <Stack gap={6}>
      <MembershipRefreshOnMount />
      <Stack gap={2}>
        <Heading size="xl">Account</Heading>
        <Text color="formLabelMuted">
          Login, security, and contact settings. Your photo, name, bio, and date
          of birth live on{' '}
          <Link as={NextLink} href="/profile" color="primary.700">
            Profile
          </Link>
          .
        </Text>
      </Stack>

      <AccountContactCard />

      {me.worker?.membership ? (
        <WorkerMembershipCard membership={me.worker.membership} />
      ) : null}

      <Card layout="section" p={{ base: 5, md: 6 }}>
        <Stack gap={4}>
          <Heading size="md">Login methods</Heading>
          <Row label="Sign-in methods" value={enabledMethods} />
        </Stack>
      </Card>

      <Card layout="section" p={{ base: 5, md: 6 }}>
        <Stack gap={4}>
          <Heading size="md">Security</Heading>
          <Row
            label="Password"
            value="Use the reset flow to change."
            hint="A reset email is sent to the address on file."
          />
          <HStack gap={3} flexWrap="wrap">
            <Link
              as={NextLink}
              href="/forgot-password"
              _hover={{ textDecoration: 'none' }}
            >
              <Button size="sm" variant="ghost">
                Reset password
              </Button>
            </Link>
          </HStack>
        </Stack>
      </Card>

      <AccountSettingsCard />

      <Card layout="section" p={{ base: 5, md: 6 }}>
        <Stack gap={4}>
          <Heading size="md">Session</Heading>
          <Text fontSize="sm" color="formLabelMuted">
            Logging out clears the session token and the cached `me` snapshot.
          </Text>
          <Box>
            <Button size="sm" variant="ghost" onClick={handleLogout}>
              Log out
            </Button>
          </Box>
        </Stack>
      </Card>
    </Stack>
  )
}
