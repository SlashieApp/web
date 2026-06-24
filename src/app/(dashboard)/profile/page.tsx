'use client'

import { Box, HStack, Heading, Stack, Text } from '@chakra-ui/react'

import { useUserStore } from '@/app/(auth)/store/user'

import { MembershipRefreshOnMount } from '../components/MembershipRefreshOnMount'
import { WorkerMembershipCard } from '../components/WorkerMembershipCard'
import { ProfileCompletenessCard } from './components/ProfileCompletenessCard'
import { ProfileDetailsForm } from './components/ProfileDetailsForm'
import { ProfilePhoneSection } from './components/ProfilePhoneSection'
import { ProfilePhotoCard } from './components/ProfilePhotoCard'
import { ProfileWorkerForm } from './components/ProfileWorkerForm'
import { ProfileWorkerSetupBanner } from './components/ProfileWorkerSetupBanner'
import { displayNameFromMe, joinMonthYear } from './profileDisplayHelpers'

export default function ProfilePage() {
  const me = useUserStore((s) => s.me)
  if (!me) return null

  return (
    <Stack gap={6}>
      <MembershipRefreshOnMount />
      <Stack gap={2}>
        <HStack gap={3} align="flex-start" flexWrap="wrap">
          <Box
            w={{ base: 16, md: 20 }}
            h={{ base: 16, md: 20 }}
            borderRadius="full"
            bg="bg.subtle"
            color="text.default"
            display="grid"
            placeItems="center"
            fontWeight={800}
            fontSize="xl"
            overflow="hidden"
            flexShrink={0}
          >
            {me.profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={me.profile.avatarUrl}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              displayNameFromMe(me).charAt(0).toUpperCase() || '?'
            )}
          </Box>
          <Stack gap={1} flex="1" minW={0}>
            <Heading size="xl">{displayNameFromMe(me)}</Heading>
            <Text color="text.muted">{me.email}</Text>
            {joinMonthYear(me.createdAt) ? (
              <Text fontSize="sm" color="text.muted">
                Joined {joinMonthYear(me.createdAt)}
              </Text>
            ) : null}
          </Stack>
        </HStack>
      </Stack>

      <ProfileCompletenessCard />
      <ProfileWorkerSetupBanner />
      {me.worker?.membership ? (
        <WorkerMembershipCard membership={me.worker.membership} />
      ) : null}
      <ProfilePhotoCard />
      <ProfilePhoneSection />
      <ProfileDetailsForm />
      <ProfileWorkerForm />
    </Stack>
  )
}
