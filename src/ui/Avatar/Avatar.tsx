'use client'

import { Box, HStack, Text, type TextProps } from '@chakra-ui/react'
import Image from 'next/image'

export type AvatarProps = {
  /** Display name / alt text for the image. */
  name: string
  src?: string
  /** When set, shown beside the image in the row; omit for image-only. */
  label?: string
  labelProps?: TextProps
}

/** Rounded list avatar; optional `label` adds the name column beside the image. */
export function Avatar({ name, src, label, labelProps }: AvatarProps) {
  const image = (
    <Box
      w={{ base: 6, md: 7 }}
      h={{ base: 6, md: 7 }}
      borderRadius="full"
      overflow="hidden"
      bg="cardAvatarEmpty"
      position="relative"
    >
      {src ? (
        <Image
          src={src}
          alt={`${name} avatar`}
          fill
          sizes="28px"
          style={{ objectFit: 'cover' }}
        />
      ) : null}
    </Box>
  )

  if (label == null || label === '') {
    return image
  }

  return (
    <HStack>
      {image}
      <Text
        fontSize="sm"
        fontWeight={600}
        color="cardMutedFg"
        truncate
        {...labelProps}
      >
        {label}
      </Text>
    </HStack>
  )
}
