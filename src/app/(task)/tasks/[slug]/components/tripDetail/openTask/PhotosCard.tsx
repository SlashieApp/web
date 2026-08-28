'use client'

import { useI11n } from '@/i18n/useI11n'
import { Box, Image, Wrap } from '@chakra-ui/react'
import bag from '../../../i11n.json'

import { formatMessage } from '@/i18n/loadPageI11n'
import { ViewTransition } from '@/ui/ViewTransition'
import { Card } from '@ui'

import { taskVtName } from '@/app/(task)/helpers/taskCardHandoff'
import { useTaskDetail } from '../../../context/TaskDetailProvider'

/**
 * "Photos" card — compact square thumbnails (kept small on purpose so the photo
 * strip doesn't dominate the column). Renders nothing when the task has no
 * images and the listing card didn't hand off one either.
 */
export function PhotosCard() {
  const { task, seed, taskId } = useTaskDetail()
  const t = useI11n(bag)
  const loadedImages = (task?.images ?? []).filter((src): src is string =>
    Boolean(src?.trim()),
  )
  const seedImage = seed?.thumbnailSrc?.trim() || undefined
  const images = task ? loadedImages : seedImage ? [seedImage] : []
  const named = images.length > 0

  if (images.length === 0) return null

  const title = task
    ? (task.title ?? t.fallbackTask)
    : (seed?.title ?? t.fallbackTask)

  return (
    <Card layout="section" heading={t.details.photos}>
      <Wrap gap={2}>
        {images.map((src, index) => {
          const well = (
            <Box
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
                alt={formatMessage(t.details.photoAlt, {
                  title,
                  n: index + 1,
                })}
                w="full"
                h="full"
                objectFit="cover"
              />
            </Box>
          )
          return (
            <ViewTransition
              key={src}
              name={
                index === 0 && named ? taskVtName('img', taskId) : undefined
              }
              share="auto"
              default="none"
            >
              {well}
            </ViewTransition>
          )
        })}
      </Wrap>
    </Card>
  )
}
