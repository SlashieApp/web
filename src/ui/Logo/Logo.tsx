'use client'

import { Box, Image, type ImageProps } from '@chakra-ui/react'

import { useAppTheme } from '@/app/ThemeProvider'

export type LogoProps = Omit<ImageProps, 'src' | 'alt'>

/** Slashie brand logo with light/dark asset switching. */
export function Logo(props: LogoProps) {
  const { mode } = useAppTheme()
  const src =
    mode === 'light'
      ? '/images/slashie-logo-light.png'
      : '/images/slashie-logo-dark.png'

  return (
    <Box as="span" display="inline-block" lineHeight={0}>
      <Image
        src={src}
        alt="Slashie"
        h={{ base: '20px', md: '22px' }}
        w="auto"
        objectFit="contain"
        {...props}
      />
    </Box>
  )
}
