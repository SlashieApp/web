'use client'

import { useCallback, useMemo, useState } from 'react'

import { publishSearchMapCentre } from '@/utils/taskHandoff'
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
import type { TaskMapStack } from '../../../helpers/taskMap'
import {
  useOpenBrowseTaskFromMap,
  useSelectBrowseTaskFromMap,
} from '../../../helpers/useSelectBrowseTaskFromMap'
import {
  SEARCH_CTRL_TOP,
  SEARCH_TOUCH_CTRL_TOP,
} from '../../helpers/searchChrome'
import { TaskStackList } from './TaskStackList'

const SINGLE_PANEL_BUTTON_LEFT_INSET = '1.25rem + min(420px, 38vw)'

/**
 * Publishes `/search` map bindings into the layout-level Mapbox host.
 * The canvas itself lives in `MarketplaceMapHost` so it survives the
 * search → task-detail page transition. Renders the same-spot task list
 * the map opens for a cluster that cannot split.
 */
export function SearchMapLayer({ isDesktop }: { isDesktop: boolean }) {
  const mapBindings = useTaskMapBindings()
  const { windowOffsetWidth } = useTaskBrowseLayout()
  const { onNavRoutePresentingChange } = useTaskBrowseData()
  const selectFromMap = useSelectBrowseTaskFromMap()
  const openFromMap = useOpenBrowseTaskFromMap()
  // A state setter: stable, since the published layer ignores callback changes.
  const [stack, setStack] = useState<TaskMapStack | null>(null)
  const closeStack = useCallback(() => setStack(null), [])

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
        // Zoom lines up with the search bar; on touch phones the compass
        // sits under the bar and chips (FE-208).
        compactCtrlTopOffset: SEARCH_CTRL_TOP,
        touchCtrlTopOffset: SEARCH_TOUCH_CTRL_TOP,
        onNavRoutePresentingChange,
        onSelectTask: selectFromMap,
        onOpenTaskStack: setStack,
        onCenterChange: publishSearchMapCentre,
      },
    }),
    [
      isDesktop,
      mapBindings,
      mapBindings.selectedTaskId,
      mapBindings.selectedTaskSelectionToken,
      onNavRoutePresentingChange,
      selectFromMap,
      windowOffsetWidth,
    ],
  )

  usePublishMarketplaceMap(layer, { resetFocusOnMount: true })
  return (
    <TaskStackList
      stack={stack}
      tasks={mapBindings.tasks}
      isDesktop={isDesktop}
      onSelect={openFromMap}
      onClose={closeStack}
    />
  )
}
