'use client'

import { Box } from '@chakra-ui/react'

import { MOBILE_BOTTOM_NAV_CLEARANCE } from '@/ui/MobileBottomNav'
import { TaskMap } from '../../../components/TaskMap'
import {
  useTaskBrowseData,
  useTaskBrowseLayout,
  useTaskMapBindings,
} from '../../../context/TaskBrowseProvider'
import { mapboxCanvasFadeCss } from '../../../helpers/mapboxCanvasFade'
import { useSelectBrowseTaskFromMap } from '../../../helpers/useSelectBrowseTaskFromMap'

const SINGLE_PANEL_BUTTON_LEFT_INSET = '1.25rem + min(420px, 38vw)'

/**
 * Lift Mapbox logo/attribution just above the task-card carousel and the glass
 * nav. Search stays in the mobile shell until `lg`. 7.5rem ≈ card + padding.
 */
const SEARCH_MOBILE_MAP_CTRL_BOTTOM = `calc(${MOBILE_BOTTOM_NAV_CLEARANCE} + 7.5rem)`

/**
 * Map instance for /search task browse. Mapbox wordmark sits bottom-right so
 * it is not covered by the desktop list column.
 */
export function SearchMapLayer({ isDesktop }: { isDesktop: boolean }) {
  const mapBindings = useTaskMapBindings()
  const { windowOffsetWidth } = useTaskBrowseLayout()
  const { onNavRoutePresentingChange } = useTaskBrowseData()
  const selectFromMap = useSelectBrowseTaskFromMap()

  return (
    <Box
      position="absolute"
      inset={0}
      h="full"
      zIndex={isDesktop ? 1 : 0}
      css={mapboxCanvasFadeCss('search')}
    >
      <TaskMap
        {...mapBindings}
        leftViewportPadding={isDesktop ? windowOffsetWidth : undefined}
        searchAreaButtonLeftInset={
          isDesktop ? SINGLE_PANEL_BUTTON_LEFT_INSET : undefined
        }
        logoPosition="bottom-right"
        mobileCtrlBottomOffset={
          isDesktop ? undefined : SEARCH_MOBILE_MAP_CTRL_BOTTOM
        }
        onNavRoutePresentingChange={onNavRoutePresentingChange}
        onSelectTask={selectFromMap}
      />
    </Box>
  )
}
