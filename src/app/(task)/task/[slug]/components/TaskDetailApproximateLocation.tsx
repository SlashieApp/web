'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'

import { IconMapPin } from '@/icons/taskMeta'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'
import { GlassCard } from '@ui'

import { TaskDetailLocationMap } from './TaskDetailLocationMap'
import { type TaskDetailRecord, taskMapCoordinates } from './taskDetailUtils'

export type TaskDetailApproximateLocationProps = {
  task: TaskDetailRecord
  /** Owner sees full address line when available and copy about sharing after accept. */
  variant?: 'public' | 'owner'
}

export function TaskDetailApproximateLocation({
  task,
  variant = 'public',
}: TaskDetailApproximateLocationProps) {
  const place = taskPublicLocationLabel(task)
  const ownerLine =
    variant === 'owner' ? task.location?.address?.trim() || place || null : null
  const heading =
    variant === 'owner' ? 'Service location' : 'Approximate location'
  const coords = taskMapCoordinates(task)
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  if (!place && !coords && !ownerLine) return null

  return (
    <GlassCard
      p={{ base: 5, md: 6 }}
      borderColor="jobCardBorder"
      boxShadow="ambient"
    >
      <Stack gap={4}>
        <HStack gap={2}>
          <IconMapPin color="primary.600" />
          <Text fontSize="md" fontWeight={700} color="jobCardTitle">
            {heading}
          </Text>
        </HStack>
        {coords ? (
          mapboxToken?.trim() ? (
            <TaskDetailLocationMap
              accessToken={mapboxToken}
              lat={coords.lat}
              lng={coords.lng}
            />
          ) : (
            <Box
              borderRadius="lg"
              borderWidth="1px"
              borderColor="jobCardBorder"
              bg="jobCardBg"
              minH="140px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              px={4}
            >
              <Text fontSize="sm" color="formLabelMuted" textAlign="center">
                Map preview needs a Mapbox token in the environment.
              </Text>
            </Box>
          )
        ) : null}
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
          <Text fontSize="sm" color="formLabelMuted" lineHeight="tall">
            {variant === 'owner' && ownerLine ? (
              <>
                <Text as="span" fontWeight={600} color="jobCardTitle">
                  {ownerLine}.
                </Text>{' '}
              </>
            ) : place ? (
              <>
                <Text as="span" fontWeight={600} color="jobCardTitle">
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
