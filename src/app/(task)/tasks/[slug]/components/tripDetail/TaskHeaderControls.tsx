'use client'

import { useRouter } from 'next/navigation'
import { LuArrowLeft } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { sdlMotion } from '@/theme/styles'
import { IconButton } from '@ui'

import bag from '../../i11n.json'

const controlTransition = {
  transitionProperty: 'background-color, opacity',
  transitionDuration: sdlMotion.duration.slow,
  transitionTimingFunction: sdlMotion.easing.standard,
} as const

type OverlayChipProps = {
  /** Translucent chips when the control floats over the map. */
  overlay?: boolean
}

/**
 * Back control for task detail. Ghost on solid chrome; frosted over the map.
 */
export function TaskBackButton({ overlay = false }: OverlayChipProps) {
  const router = useRouter()
  const t = useI11n(bag)

  return (
    <IconButton
      type="button"
      variant="ghost"
      aria-label={t.nav.goBackAria}
      color="text.default"
      bg={overlay ? 'whiteAlpha.700' : 'transparent'}
      _hover={{
        bg: overlay ? 'whiteAlpha.900' : 'bg.subtle',
        color: 'text.default',
      }}
      onClick={() => router.back()}
      {...controlTransition}
    >
      <LuArrowLeft />
    </IconButton>
  )
}
