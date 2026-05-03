'use client'

import { Stack, Text } from '@chakra-ui/react'

import { ImageGallery, type ImageGalleryItem } from '@ui'

import { useTaskDetail } from '../context/TaskDetailProvider'

export function TaskDetailPhotoGrid() {
  const { task } = useTaskDetail()
  const sectionTitle = 'PHOTOS'

  if (!task) return null

  const items: ImageGalleryItem[] = (task.images ?? [])
    .filter((src): src is string => Boolean(src?.trim()))
    .map((src) => ({ src, alt: task.title }))

  return (
    <Stack gap={3}>
      <Text
        fontSize="sm"
        fontWeight={700}
        color="formLabelMuted"
        letterSpacing="0.06em"
      >
        {sectionTitle}
      </Text>
      {items.length > 0 ? (
        <ImageGallery items={items} />
      ) : (
        <Text fontSize="sm" color="formLabelMuted">
          No photos yet
        </Text>
      )}
    </Stack>
  )
}
