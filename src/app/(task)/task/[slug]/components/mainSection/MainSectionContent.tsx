'use client'

import {
  Box,
  Grid,
  HStack,
  Heading,
  Stack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'

import { formatTaskContactMethodLabel } from '@/utils/taskLocationDisplay'
import { ImageGallery, type ImageGalleryItem } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import type { TaskDetailRecord } from '../../helpers/taskDetailUtils'
import { TaskPhotoStrip } from './TaskPhotoStrip'
import { TaskSecondaryDetailsGrid } from './TaskSecondaryDetailsGrid'

function posterDisplayName(task: TaskDetailRecord): string {
  const profileName = task.poster?.profile?.name?.trim()
  if (profileName) return profileName
  const first = task.poster?.firstName?.trim() ?? ''
  const last = task.poster?.lastName?.trim() ?? ''
  const combined = `${first} ${last}`.trim()
  return combined || 'Task owner'
}

export function MainSectionContent() {
  const { task } = useTaskDetail()
  const isXlUp =
    useBreakpointValue({ base: false, xl: true }, { fallback: 'base' }) ?? false

  if (!task) return null

  const photoItems: ImageGalleryItem[] = (task.images ?? [])
    .filter((src): src is string => Boolean(src?.trim()))
    .map((src) => ({ src, alt: task.title }))

  const posterName = posterDisplayName(task)
  const posterInitials =
    posterName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || 'TO'

  return (
    <Stack gap={{ base: 6, lg: 8 }} w="full">
      <Stack gap={4} w="full">
        <Heading size="md" fontWeight={800} lineHeight="short">
          About this task
        </Heading>
        <Text color="formLabelMuted" lineHeight="tall">
          {task.description}
        </Text>
        {task.contactMethod ? (
          <Grid
            templateColumns={{
              base: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
            }}
            gap={3}
            pt={2}
            borderTopWidth="1px"
            borderColor="cardBorder"
            fontSize="sm"
          >
            <Text color="formLabelMuted">
              <Text as="span" fontWeight={600} color="cardFg">
                Contact:{' '}
              </Text>
              {formatTaskContactMethodLabel(task.contactMethod)}
            </Text>
          </Grid>
        ) : null}
      </Stack>

      {photoItems.length > 0 ? (
        isXlUp ? (
          <ImageGallery items={photoItems} />
        ) : (
          <TaskPhotoStrip items={photoItems} />
        )
      ) : (
        <Text fontSize="sm" color="formLabelMuted">
          No photos yet
        </Text>
      )}

      <TaskSecondaryDetailsGrid />

      <Box
        borderWidth="1px"
        borderColor="cardBorder"
        borderRadius="xl"
        bg="cardBg"
        p={{ base: 4, md: 5 }}
      >
        <HStack align="flex-start" gap={4} w="full">
          <Box
            flexShrink={0}
            boxSize="56px"
            borderRadius="full"
            bg="primary.100"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="primary.700"
            fontWeight={800}
            fontSize="sm"
          >
            {posterInitials}
          </Box>
          <Stack gap={1} flex={1} minW={0}>
            <Text
              fontSize="xs"
              fontWeight={700}
              color="formLabelMuted"
              letterSpacing="0.06em"
              textTransform="uppercase"
            >
              Task owner
            </Text>
            <Heading size="sm" lineHeight="short">
              {posterName}
            </Heading>
          </Stack>
        </HStack>
      </Box>
    </Stack>
  )
}
