'use client'

import { Box, HStack, Heading, Image, Stack, Text } from '@chakra-ui/react'
import { LuCheck } from 'react-icons/lu'

import { Badge } from '@ui'

import { useWorkerProfile } from '../context/WorkerProfileContext'
import {
  formatMemberSince,
  workerPublicAvatarLabel,
  workerPublicDisplayName,
  workerServiceAreaLabel,
} from '../helpers/workerProfileHelpers'

export function WorkerProfileHeader() {
  const { worker } = useWorkerProfile()
  const name = workerPublicDisplayName(worker)
  const avatarLabel = workerPublicAvatarLabel(worker)
  const avatarUrl = worker.profile?.avatarUrl?.trim() || null
  const serviceArea = workerServiceAreaLabel(worker)
  const memberSince = formatMemberSince(worker.user.createdAt)

  return (
    <Box
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="xl"
      bg="bg.surface"
      p={{ base: 4, md: 6 }}
      w="full"
    >
      <HStack
        align="flex-start"
        gap={4}
        w="full"
        flexWrap={{ base: 'wrap', md: 'nowrap' }}
      >
        <Box
          flexShrink={0}
          boxSize={{ base: '72px', md: '88px' }}
          borderRadius="full"
          bg="status.success.soft"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="status.success.fg"
          fontWeight={800}
          fontSize="lg"
          overflow="hidden"
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={`${name} avatar`}
              w="full"
              h="full"
              objectFit="cover"
            />
          ) : (
            avatarLabel
          )}
        </Box>
        <Stack gap={2} flex={1} minW={0}>
          <Text
            fontSize="xs"
            fontWeight={700}
            color="text.muted"
            letterSpacing="0.06em"
            textTransform="uppercase"
          >
            Worker on Slashie
          </Text>
          <HStack gap={2} align="center" flexWrap="wrap">
            <Heading size={{ base: 'md', md: 'lg' }} lineHeight="short">
              {name}
            </Heading>
            {worker.isVerified ? (
              <Badge
                variant="success"
                display="inline-flex"
                alignItems="center"
                gap={1}
              >
                <Box
                  as="span"
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  boxSize="16px"
                  borderRadius="full"
                  bg="action.primary"
                  color="text.onGreen"
                  flexShrink={0}
                  aria-hidden
                >
                  <LuCheck size={10} strokeWidth={3} />
                </Box>
                Verified worker
              </Badge>
            ) : null}
          </HStack>
          {serviceArea ? (
            <Text fontSize="sm" color="text.muted" fontWeight={500}>
              Service area · {serviceArea}
            </Text>
          ) : null}
          {memberSince ? (
            <Text fontSize="sm" color="text.muted">
              Member since {memberSince}
            </Text>
          ) : null}
          <Text fontSize="sm" color="text.muted" fontWeight={500}>
            No reviews yet
          </Text>
        </Stack>
      </HStack>
    </Box>
  )
}
