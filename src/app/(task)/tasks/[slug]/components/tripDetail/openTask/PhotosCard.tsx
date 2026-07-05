'use client'

import { Box, Image, Wrap } from '@chakra-ui/react'

import { Card } from '@ui'

import { useTaskDetail } from '../../../context/TaskDetailProvider'

/**
 * "Photos" card — compact square thumbnails (kept small on purpose so the photo
 * strip doesn't dominate the column). Renders nothing when the task has no images.
 */
export function PhotosCard() {
  const { task } = useTaskDetail()
  const images = (task?.images ?? []).filter((src): src is string =>
    Boolean(src?.trim()),
  )
  if (images.length === 0) return null

  return (
    <Card layout="section" heading="Photos">
      <Wrap gap={2}>
        {images.map((src, index) => (
          <Box
            key={src}
            boxSize={{ base: '84px', md: '96px' }}
            borderRadius="lg"
            overflow="hidden"
            borderWidth="1px"
            borderColor="border.default"
            bg="bg.subtle"
            flexShrink={0}
          >
            <Image
              src={src}
              alt={`${task?.title ?? 'Task'} photo ${index + 1}`}
              w="full"
              h="full"
              objectFit="cover"
            />
          </Box>
        ))}
      </Wrap>
    </Card>
  )
}
