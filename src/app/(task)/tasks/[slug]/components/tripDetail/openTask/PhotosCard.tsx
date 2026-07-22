'use client'

import { useI11n } from '@/i18n/useI11n'
import { Box, Image, Wrap } from '@chakra-ui/react'
import bag from '../../../i11n.json'

import { formatMessage } from '@/i18n/loadPageI11n'
import { Card } from '@ui'

import { useTaskDetail } from '../../../context/TaskDetailProvider'

/**
 * "Photos" card — compact square thumbnails (kept small on purpose so the photo
 * strip doesn't dominate the column). Renders nothing when the task has no images.
 */
export function PhotosCard() {
  const { task } = useTaskDetail()
  const t = useI11n(bag)
  const images = (task?.images ?? []).filter((src): src is string =>
    Boolean(src?.trim()),
  )
  if (images.length === 0) return null

  const title = task?.title ?? t.fallbackTask

  return (
    <Card layout="section" heading={t.details.photos}>
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
              alt={formatMessage(t.details.photoAlt, {
                title,
                n: index + 1,
              })}
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
