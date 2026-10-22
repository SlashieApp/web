'use client'

import { Image, Spinner, Stack, Text, VisuallyHidden } from '@chakra-ui/react'
import { LuImageOff } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'

import bag from './i11n.json'

/**
 * `ready`: the photo. `converting`: a HEIC or HEIF photo is becoming a JPEG
 * this browser can show. `unavailable`: it can't be shown here (it still
 * uploads, and the API converts it).
 */
export type PhotoTileState = 'ready' | 'converting' | 'unavailable'

export type PhotoTileProps = {
  state: PhotoTileState
  /** The photo to show when `ready`. */
  src?: string | null
  /** Names the photo, such as "Photo 2". */
  alt: string
  /** Width and height, such as "88px". */
  size: string
  /** A circle (profile photos) instead of a rounded square. */
  round?: boolean
}

/**
 * SDL PhotoTile. A picked photo's preview, or, while there is none, a quiet
 * tile that says why: a spinner with "Converting photo…" (`aria-busy`), or
 * "Preview not available". Status is text and icon, never color alone.
 */
export function PhotoTile({
  state,
  src,
  alt,
  size,
  round = false,
}: PhotoTileProps) {
  const t = useI11n(bag)
  const shape = {
    boxSize: size,
    flexShrink: 0,
    borderRadius: round ? 'full' : 'lg',
    borderWidth: '1px',
    borderColor: 'border.default',
  } as const

  if (state === 'ready' && src) {
    return <Image src={src} alt={alt} objectFit="cover" {...shape} />
  }

  const converting = state === 'converting'
  return (
    <Stack
      aria-busy={converting || undefined}
      gap={1}
      align="center"
      justify="center"
      px={2}
      bg="bg.subtle"
      color="text.muted"
      textAlign="center"
      overflow="hidden"
      {...shape}
    >
      <VisuallyHidden>{alt}</VisuallyHidden>
      {converting ? (
        <Spinner size="sm" borderWidth="2px" aria-hidden />
      ) : (
        <LuImageOff size={18} aria-hidden />
      )}
      <Text fontSize="xs" lineHeight="short" fontWeight={500}>
        {converting ? t.converting : t.unavailable}
      </Text>
    </Stack>
  )
}
