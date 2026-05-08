'use client'

import { Box, HStack, Heading, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'

import { Badge, Button, SectionCard } from '@ui'

import { useUserStore } from '@/app/(auth)/store/user'

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
      <Stack gap={2}>
        <Heading size="xl">Account</Heading>
        <Text color="formLabelMuted">
          Settings, preferences, and session controls. Editable profile fields
          live under <strong>Profile</strong>.
        </Text>
      </Stack>

      <SectionCard p={{ base: 5, md: 6 }}>
        <Stack gap={4}>
          <Heading size="md">Identity</Heading>
          <Row label="Email" value={me.email} />
          <Row
            label="Display name"
            value={me.profile?.name?.trim() || '—'}
            hint="Edit on the Profile page."
          />
          <Row
            label="Phone"
            value={me.profile?.contactNumber?.trim() || 'Not set'}
            hint="Edit on the Profile page."
          />
          <Row label="Login methods" value={enabledMethods} />
        </Stack>
      </SectionCard>

      <SectionCard p={{ base: 5, md: 6 }}>
        <Stack gap={4}>
          <HStack justify="space-between" gap={3} flexWrap="wrap">
            <Heading size="md">Worker tools</Heading>
            <Badge
              bg={me.worker?.id ? 'primary.100' : 'badgeBg'}
              color={me.worker?.id ? 'primary.800' : 'cardFg'}
            >
              {me.worker?.id ? 'Active' : 'Not set up'}
            </Badge>
          </HStack>
          <Text fontSize="sm" color="formLabelMuted">
            Worker setup is part of your profile. Both the customer and worker
            sides of your account share this dashboard.
          </Text>
          <Link
            as={NextLink}
            href="/profile"
            _hover={{ textDecoration: 'none' }}
            alignSelf="flex-start"
          >
            <Button size="sm" variant="secondary">
              Open profile
            </Button>
          </Link>
        </Stack>
      </SectionCard>

      <SectionCard p={{ base: 5, md: 6 }}>
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
      </SectionCard>

      <SectionCard p={{ base: 5, md: 6 }}>
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
      </SectionCard>
    </Stack>
  )
}
