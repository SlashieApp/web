'use client'

import { Box, Image, type ImageProps } from '@chakra-ui/react'
import { useCallback, useState } from 'react'

import { useColorMode } from '../color-mode'
export type LogoProps = Omit<ImageProps, 'src' | 'alt'>

export function Logo(props: LogoProps) {
  const [mounted, setMounted] = useState(false)
  const { colorMode } = useColorMode()
  const logoSrc =
    colorMode === 'light'
      ? '/images/slashie-logo-light.png'
      : '/images/slashie-logo-dark.png'
  const handleMountRef = useCallback((node: HTMLSpanElement | null) => {
    if (node) setMounted(true)
  }, [])

  return (
    <Box as="span" ref={handleMountRef} display="inline-block" lineHeight={0}>
      {mounted ? (
        <Image
          h={{ base: '20px', md: '22px' }}
          w="auto"
          objectFit="contain"
          {...props}
          src={logoSrc}
          alt={`Slashie ${colorMode}`}
        />
      ) : null}
    </Box>
  )
}
