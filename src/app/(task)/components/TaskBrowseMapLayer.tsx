'use client'

import { Box } from '@chakra-ui/react'

import {
  useTaskBrowseData,
  useTaskBrowseLayout,
  useTaskMapBindings,
} from '../context/TaskBrowseProvider'
import { TaskMap } from './TaskMap'

const SINGLE_PANEL_BUTTON_LEFT_INSET = '1.25rem + min(420px, 38vw)'

type TaskBrowseMapLayerProps = {
  /** When true, apply desktop map padding and search-area button inset. */
  isDesktop: boolean
}

/**
 * Single `TaskMap` instance for the task browse page so the map is not unmounted
 * when switching between web/mobile layouts on viewport resize.
 */
export function TaskBrowseMapLayer({ isDesktop }: TaskBrowseMapLayerProps) {
  const mapBindings = useTaskMapBindings()
  const { windowOffsetWidth, setIsFilterOpen } = useTaskBrowseLayout()
  const { setSelectedTaskId } = useTaskBrowseData()

  return (
    <Box position="absolute" inset={0} zIndex={isDesktop ? 1 : 0}>
      <TaskMap
        {...mapBindings}
        leftViewportPadding={isDesktop ? windowOffsetWidth : undefined}
        searchAreaButtonLeftInset={
          isDesktop ? SINGLE_PANEL_BUTTON_LEFT_INSET : undefined
        }
        onSelectTask={(taskId) => {
          if (taskId) setIsFilterOpen(false)
          setSelectedTaskId(taskId)
        }}
      />
    </Box>
  )
}
