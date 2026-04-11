'use client'

import { Box } from '@chakra-ui/react'

import { useTaskBrowseLayout } from '../context/TaskBrowseProvider'

import { SearchThisAreaButton } from './SearchThisAreaButton'

export type TaskBrowseSearchThisAreaButtonProps = {
  /**
   * When true (web browse), wraps the button in a full-width bottom overlay with
   * centered flex and pointer-event passthrough. When false (default), renders
   * only the button for stacking in a parent (e.g. mobile column).
   */
  overlay?: boolean
}

/** Wires `SearchThisAreaButton` to `searchThisAreaUi` from task browse layout context. */
export function TaskBrowseSearchThisAreaButton({
  overlay = false,
}: TaskBrowseSearchThisAreaButtonProps) {
  const { searchThisAreaUi } = useTaskBrowseLayout()
  const button = <SearchThisAreaButton {...searchThisAreaUi} />

  if (!overlay) {
    return button
  }

  return (
    <Box
      position="absolute"
      bottom={6}
      left={0}
      right={0}
      zIndex={3}
      display="flex"
      justifyContent="center"
      pointerEvents="none"
    >
      <Box pointerEvents="auto">{button}</Box>
    </Box>
  )
}
