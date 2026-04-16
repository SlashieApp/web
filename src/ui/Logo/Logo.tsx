'use client'

import { Box, Image, type ImageProps } from '@chakra-ui/react'

import { useColorMode } from '../color-mode'
export type LogoProps = Omit<ImageProps, 'src' | 'alt'>

export function Logo(props: LogoProps) {
  const { colorMode } = useColorMode()
  const logoSrc =
    colorMode === 'light'
      ? '/images/slashie-logo-light.png'
      : '/images/slashie-logo-dark.png'

  return (
    <Box as="span" display="inline-block" lineHeight={0}>
      <Image
        h={{ base: '20px', md: '22px' }}
        w="auto"
        objectFit="contain"
        {...props}
        src={logoSrc}
        alt="Slashie"
      />
      <Box hidden>{colorMode}</Box>
    </Box>
  )
}
