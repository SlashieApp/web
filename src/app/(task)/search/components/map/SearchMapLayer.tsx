'use client'

import { useMemo } from 'react'

import { usePublishMarketplaceMap } from '../../../context/MarketplaceMapSession'
import {
  useTaskBrowseData,
  useTaskBrowseLayout,
  useTaskMapBindings,
} from '../../../context/TaskBrowseProvider'
import {
  type MarketplaceMapPublishedLayer,
  overlayCtrlBottomOffsetForMobile,
} from '../../../helpers/marketplaceMap'
import { useSelectBrowseTaskFromMap } from '../../../helpers/useSelectBrowseTaskFromMap'

const SINGLE_PANEL_BUTTON_LEFT_INSET = '1.25rem + min(420px, 38vw)'

/**
 * Publishes `/search` map bindings into the layout-level Mapbox host.
 * The canvas itself lives in `MarketplaceMapHost` so it survives the
 * search → task-detail page transition.
 */
export function SearchMapLayer({ isDesktop }: { isDesktop: boolean }) {
  const mapBindings = useTaskMapBindings()
  const { windowOffsetWidth } = useTaskBrowseLayout()
  const { onNavRoutePresentingChange } = useTaskBrowseData()
  const selectFromMap = useSelectBrowseTaskFromMap()

  const layer = useMemo<MarketplaceMapPublishedLayer>(
    () => ({
      source: 'browse',
      cameraMode: 'browse',
      variant: 'exact',
      props: {
        ...mapBindings,
        leftViewportPadding: isDesktop ? windowOffsetWidth : undefined,
        searchAreaButtonLeftInset: isDesktop
          ? SINGLE_PANEL_BUTTON_LEFT_INSET
          : undefined,
        logoPosition: 'bottom-right',
        mobileCtrlBottomOffset: isDesktop
          ? undefined
          : overlayCtrlBottomOffsetForMobile(),
        onNavRoutePresentingChange,
        onSelectTask: selectFromMap,
      },
    }),
    [
      isDesktop,
      mapBindings,
      onNavRoutePresentingChange,
      selectFromMap,
      windowOffsetWidth,
    ],
  )

  usePublishMarketplaceMap(layer, { resetFocusOnMount: true })
  return null
}
