'use client'

import { Box, Image, type ImageProps } from '@chakra-ui/react'
import type { ComponentProps } from 'react'
import { useCallback, useState } from 'react'

import { useColorMode } from '../color-mode'

export type LogoProps = Omit<ImageProps, 'src' | 'alt'> & {
  /** Merged onto the wrapper around the image (e.g. `display="block"`, `w="full"`). */
  containerProps?: Omit<ComponentProps<typeof Box>, 'children'>
}

export function Logo({ containerProps, ...props }: LogoProps) {
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
    <Box
      as="span"
      ref={handleMountRef}
      display="inline-block"
      lineHeight={0}
      {...containerProps}
    >
      {mounted ? (
        <Image
          h={{ base: '24px', md: '32px' }}
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
