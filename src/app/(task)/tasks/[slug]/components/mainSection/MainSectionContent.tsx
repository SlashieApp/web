'use client'

import {
  Grid,
  Heading,
  Stack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'

import { formatTaskContactMethodLabel } from '@/utils/taskLocationDisplay'
import { ImageGallery, type ImageGalleryItem } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TaskPhotoStrip } from './TaskPhotoStrip'
import { TaskSecondaryDetailsGrid } from './TaskSecondaryDetailsGrid'

export function MainSectionContent() {
  const { task } = useTaskDetail()
  const isXlUp =
    useBreakpointValue({ base: false, xl: true }, { fallback: 'base' }) ?? false

  if (!task) return null

  const photoItems: ImageGalleryItem[] = (task.images ?? [])
    .filter((src): src is string => Boolean(src?.trim()))
    .map((src) => ({ src, alt: task.title }))

  return (
    <Stack gap={{ base: 6, lg: 8 }} w="full">
      <Stack gap={4} w="full">
        <Heading size="md" fontWeight={800} lineHeight="short">
          About this task
        </Heading>
        <Text color="text.muted" lineHeight="tall">
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
            borderColor="border.default"
            fontSize="sm"
          >
            <Text color="text.muted">
              <Text as="span" fontWeight={600} color="text.default">
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
        <Text fontSize="sm" color="text.muted">
          No photos yet
        </Text>
      )}

      <TaskSecondaryDetailsGrid />
    </Stack>
  )
}
