'use client'

import { Box, HStack, Image, Text } from '@chakra-ui/react'
import { useState } from 'react'

import type { ImageGalleryItem } from '@ui'

const MAX_VISIBLE = 3
const GAP_PX = 8
const RADIUS = 'xl'

type TaskPhotoStripProps = {
  items: ImageGalleryItem[]
}

/**
 * Mobile-style thumbnail strip (design reference: three tiles + “+N” overlay).
 * Used below `xl`; wider viewports use full `ImageGallery` bento.
 */
export function TaskPhotoStrip({ items }: TaskPhotoStripProps) {
  if (items.length === 0) return null

  const visible = items.slice(0, MAX_VISIBLE)
  const extra = items.length - MAX_VISIBLE

  return (
    <HStack as="section" gap={`${GAP_PX}px`} w="full" aria-label="Task photos">
      {visible.map((item, index) => {
        const isLastOverlay = index === MAX_VISIBLE - 1 && extra > 0
        return (
          <PhotoThumb
            key={`${item.src}-${index}`}
            src={item.src}
            alt={item.alt}
            overlayLabel={isLastOverlay ? `+${extra} photos` : undefined}
          />
        )
      })}
    </HStack>
  )
}

function PhotoThumb({
  src,
  alt,
  overlayLabel,
}: {
  src: string
  alt: string
  overlayLabel?: string
}) {
  const [broken, setBroken] = useState(false)

  return (
    <Box
      position="relative"
      flex="1 1 0"
      minW={0}
      aspectRatio={1}
      borderRadius={RADIUS}
      overflow="hidden"
      borderWidth="1px"
      borderColor="cardBorder"
      bg="cardAvatarEmpty"
    >
      {broken ? (
        <Text
          fontSize="xs"
          color="formLabelMuted"
          textAlign="center"
          px={2}
          py={8}
        >
          Unavailable
        </Text>
      ) : (
        <Image
          src={src}
          alt={alt}
          w="full"
          h="full"
          objectFit="cover"
          onError={() => setBroken(true)}
        />
      )}
      {overlayLabel ? (
        <Box
          position="absolute"
          inset={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="blackAlpha.700"
          color="white"
          fontSize="sm"
          fontWeight={700}
        >
          {overlayLabel}
        </Box>
      ) : null}
    </Box>
  )
}
