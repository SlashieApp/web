'use client'

import { Box, HStack, Image, Stack, Text } from '@chakra-ui/react'

import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'
import { GlassCard, IconMapPin } from '@ui'

import type { TaskDetailRecord } from './taskDetailUtils'

export type TaskDetailApproximateLocationProps = {
  task: TaskDetailRecord
  mapImageUrl: string | null
  /** Owner sees full address line when available and copy about sharing after accept. */
  variant?: 'public' | 'owner'
}

export function TaskDetailApproximateLocation({
  task,
  mapImageUrl,
  variant = 'public',
}: TaskDetailApproximateLocationProps) {
  const place = taskPublicLocationLabel(task)
  const ownerLine =
    variant === 'owner' ? task.address?.trim() || place || null : null
  const heading =
    variant === 'owner' ? 'Service location' : 'Approximate location'
  if (!place && !mapImageUrl && !ownerLine) return null

  return (
    <GlassCard p={{ base: 5, md: 6 }} borderColor="border" boxShadow="ambient">
      <Stack gap={4}>
        <HStack gap={2}>
          <IconMapPin color="primary.600" />
          <Text fontSize="md" fontWeight={700} color="fg">
            {heading}
          </Text>
        </HStack>
        {mapImageUrl ? (
          <Box
            borderRadius="lg"
            overflow="hidden"
            borderWidth="1px"
            borderColor="border"
            bg="surfaceContainerLow"
          >
            <Image
              src={mapImageUrl}
              alt=""
              w="full"
              h="auto"
              maxH="200px"
              objectFit="cover"
            />
          </Box>
        ) : (
          <Box
            borderRadius="lg"
            borderWidth="1px"
            borderColor="border"
            bg="surfaceContainerLow"
            minH="140px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            px={4}
          >
            <Text fontSize="sm" color="muted" textAlign="center">
              Map preview needs a Mapbox token in the environment.
            </Text>
          </Box>
        )}
        <HStack
          align="flex-start"
          gap={3}
          borderRadius="lg"
          bg="primary.50"
          borderWidth="1px"
          borderColor="primary.100"
          px={4}
          py={3}
        >
          <Text fontSize="lg" lineHeight={1} aria-hidden>
            ℹ️
          </Text>
          <Text fontSize="sm" color="muted" lineHeight="tall">
            {variant === 'owner' && ownerLine ? (
              <>
                <Text as="span" fontWeight={600} color="fg">
                  {ownerLine}.
                </Text>{' '}
              </>
            ) : place ? (
              <>
                <Text as="span" fontWeight={600} color="fg">
                  {place}.
                </Text>{' '}
              </>
            ) : null}
            {variant === 'owner'
              ? 'Full address is only shared with the professional after you accept their quote.'
              : 'Full address is shared after you accept a quote so the owner stays in control of their privacy.'}
          </Text>
        </HStack>
      </Stack>
    </GlassCard>
  )
}
