'use client'

import { Box } from '@chakra-ui/react'

import { TaskMap } from '../../../components/TaskMap'
import {
  useTaskBrowseData,
  useTaskBrowseLayout,
  useTaskMapBindings,
} from '../../../context/TaskBrowseProvider'
import { useSelectBrowseTaskFromMap } from '../../../helpers/useSelectBrowseTaskFromMap'

const SINGLE_PANEL_BUTTON_LEFT_INSET = '1.25rem + min(420px, 38vw)'

/**
 * Lift Mapbox logo/attribution above the glass bottom nav and the mobile
 * task-card carousel (card ~160px + carousel padding).
 */
const SEARCH_MOBILE_MAP_CTRL_BOTTOM =
  'calc(96px + env(safe-area-inset-bottom, 0px) + 11.5rem)'

/** Map instance for /search task browse. */
export function SearchMapLayer({ isDesktop }: { isDesktop: boolean }) {
  const mapBindings = useTaskMapBindings()
  const { windowOffsetWidth } = useTaskBrowseLayout()
  const { onNavRoutePresentingChange } = useTaskBrowseData()
  const selectFromMap = useSelectBrowseTaskFromMap()

  return (
    <Box
      position={{ base: 'fixed', lg: 'absolute' }}
      inset={0}
      h={{ base: '100dvh', lg: 'full' }}
      zIndex={isDesktop ? 1 : 0}
    >
      <TaskMap
        {...mapBindings}
        leftViewportPadding={isDesktop ? windowOffsetWidth : undefined}
        searchAreaButtonLeftInset={
          isDesktop ? SINGLE_PANEL_BUTTON_LEFT_INSET : undefined
        }
        mobileCtrlBottomOffset={
          isDesktop ? undefined : SEARCH_MOBILE_MAP_CTRL_BOTTOM
        }
        onNavRoutePresentingChange={onNavRoutePresentingChange}
        onSelectTask={selectFromMap}
      />
    </Box>
  )
}
