'use client'

import { chakra } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'

import bag from './i11n.json'
import { MAIN_CONTENT_ID } from './mainContent'

const SkipLinkAnchor = chakra('a')

/**
 * Keyboard skip link: hidden until focused, the first tab stop on every page
 * (marketing and the app, FE-541). It jumps past the header to the main
 * area (`#main-content`), which takes focus (`tabIndex={-1}`).
 */
export function SkipLink() {
  const t = useI11n(bag)
  return (
    <SkipLinkAnchor
      href={`#${MAIN_CONTENT_ID}`}
      position="absolute"
      top={2}
      left={2}
      zIndex={100}
      px={4}
      py={2}
      bg="bg.surface"
      color="text.default"
      fontSize="sm"
      fontWeight={500}
      borderRadius="md"
      boxShadow="e3"
      transform="translateY(-300%)"
      _focusVisible={{
        transform: 'none',
        outline: '2px solid',
        outlineColor: 'border.focus',
        outlineOffset: '2px',
      }}
    >
      {t.label}
    </SkipLinkAnchor>
  )
}
