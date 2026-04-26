'use client'

import { Box } from '@chakra-ui/react'
import Image from 'next/image'

export type ThumbnailProps = {
  alt: string
  src?: string
}

/** Square list/carousel card thumbnail with fixed list breakpoints. */
export function Thumbnail({ alt, src }: ThumbnailProps) {
  return (
    <Box
      position="relative"
      minW={'120px'}
      aspectRatio={'1 / 1'}
      borderRadius="xl"
      overflow="hidden"
      bg="cardAvatarEmpty"
    >
      {src ? (
        <Image src={src} alt={alt} fill style={{ objectFit: 'cover' }} />
      ) : null}
    </Box>
  )
}
