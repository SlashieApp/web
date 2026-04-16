'use client'

import { Box, Image, type ImageProps } from '@chakra-ui/react'

export type LogoProps = Omit<ImageProps, 'src' | 'alt'>

/** Slashie brand logo with light/dark asset switching. */
export function Logo(props: LogoProps) {
  return (
    <Box as="picture" display="inline-block" lineHeight={0}>
      <source
        srcSet="/images/slashie-logo-light.png"
        media="(prefers-color-scheme: dark)"
      />
      <Image
        src="/images/slashie-logo-dark.png"
        alt="Slashie"
        h={{ base: '20px', md: '22px' }}
        w="auto"
        objectFit="contain"
        {...props}
      />
    </Box>
  )
}
