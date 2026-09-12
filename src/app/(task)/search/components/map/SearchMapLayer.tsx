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

/** Map instance for /search task browse. */
export function SearchMapLayer({ isDesktop }: { isDesktop: boolean }) {
  const mapBindings = useTaskMapBindings()
  const { windowOffsetWidth } = useTaskBrowseLayout()
  const { onNavRoutePresentingChange } = useTaskBrowseData()
  const selectFromMap = useSelectBrowseTaskFromMap()

  return (
    <Box position="absolute" inset={0} zIndex={isDesktop ? 1 : 0}>
      <TaskMap
        {...mapBindings}
        leftViewportPadding={isDesktop ? windowOffsetWidth : undefined}
        searchAreaButtonLeftInset={
          isDesktop ? SINGLE_PANEL_BUTTON_LEFT_INSET : undefined
        }
        onNavRoutePresentingChange={onNavRoutePresentingChange}
        onSelectTask={selectFromMap}
      />
    </Box>
  )
}
