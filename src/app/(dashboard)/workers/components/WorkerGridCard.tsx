'use client'
import { Link } from '@ui'

import { Box, Heading, Image, Stack, Text } from '@chakra-ui/react'
import { LuCheck } from 'react-icons/lu'

import type { WorkerBrowseItem } from '../helpers/workerBrowseHelpers'
import {
  workerBrowseAvatarLabel,
  workerBrowseAvatarUrl,
  workerBrowseDisplayName,
  workerBrowseSubtitle,
} from '../helpers/workerBrowseHelpers'

type WorkerGridCardProps = {
  worker: WorkerBrowseItem
}

export function WorkerGridCard({ worker }: WorkerGridCardProps) {
  const name = workerBrowseDisplayName(worker)
  const avatarLabel = workerBrowseAvatarLabel(worker)
  const avatarUrl = workerBrowseAvatarUrl(worker)
  const subtitle = workerBrowseSubtitle(worker)
  const href = `/workers/${worker.id}`

  return (
    <Stack
      align="center"
      gap={3}
      p={{ base: 5, md: 6 }}
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="2xl"
      bg="bg.surface"
      boxShadow="e2"
      h="full"
      textAlign="center"
    >
      <Box position="relative" display="inline-block">
        <Box
          boxSize={{ base: '88px', md: '96px' }}
          borderRadius="full"
          bg="status.success.soft"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="status.success.fg"
          fontWeight={800}
          fontSize="lg"
          overflow="hidden"
          mx="auto"
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
        {worker.isVerified ? (
          <Box
            position="absolute"
            right={0}
            bottom={0}
            boxSize="26px"
            borderRadius="full"
            bg="action.primary"
            color="text.onGreen"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderWidth="2px"
            borderColor="bg.surface"
            aria-label="Verified worker"
          >
            <LuCheck size={14} strokeWidth={3} aria-hidden />
          </Box>
        ) : null}
      </Box>

      <Stack gap={1} w="full" minW={0}>
        <Heading size="sm" lineHeight="short">
          {name}
        </Heading>
        <Text fontSize="sm" color="text.muted" lineClamp={2}>
          {subtitle}
        </Text>
      </Stack>

      <Text fontSize="sm" color="text.muted" fontWeight={500}>
        No reviews yet
      </Text>

      <Link
        href={href}
        fontSize="sm"
        fontWeight={700}
        color="text.link"
        mt="auto"
        _hover={{ color: 'text.link', textDecoration: 'none' }}
      >
        View profile &gt;
      </Link>
    </Stack>
  )
}
