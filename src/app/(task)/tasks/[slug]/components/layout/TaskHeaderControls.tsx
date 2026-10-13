'use client'

import { useRouter } from 'next/navigation'
import { LuArrowLeft } from 'react-icons/lu'

import { useMarketplaceMapDispatch } from '@/app/(task)/context/MarketplaceMapSession'
import {
  isSearchBrowsePath,
  readRememberedSearchHref,
  taskDetailBackHref,
} from '@/app/(task)/helpers/openTaskDetailFromBrowse'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
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
 * Only ever goes to My Tasks or search (FE-210), never browser history.
 */
export function TaskBackButton({ overlay = false }: OverlayChipProps) {
  const router = useRouter()
  const localize = useLocalizedHref()
  const t = useI11n(bag)
  const mapSession = useMarketplaceMapDispatch()

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
      onClick={() => {
        const href = taskDetailBackHref(
          window.location.search,
          readRememberedSearchHref(),
        )
        if (isSearchBrowsePath(href)) mapSession?.prepareBrowse()
        router.push(localize(href))
      }}
      {...controlTransition}
    >
      <LuArrowLeft />
    </IconButton>
  )
}
