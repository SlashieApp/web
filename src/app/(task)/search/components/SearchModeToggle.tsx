'use client'

import { Box, HStack } from '@chakra-ui/react'

import { sdlFocusRing, sdlMotion } from '@/theme/styles'

import {
  useTaskBrowseData,
  useTaskBrowseLayout,
} from '../../context/TaskBrowseProvider'
import { useSearchMode } from '../context/SearchModeProvider'
import { useWorkerSearch } from '../context/WorkerSearchProvider'
import type { SearchMode } from '../helpers/searchQueryParams'

const MODE_OPTIONS: ReadonlyArray<{ value: SearchMode; label: string }> = [
  { value: 'tasks', label: 'Tasks' },
  { value: 'workers', label: 'Workers' },
]

export type SearchModeToggleBaseProps = {
  mode: SearchMode
  onModeChange: (mode: SearchMode) => void
}

/**
 * Presentational segmented control for the /search mode (also used by
 * Storybook). Two `aria-pressed` buttons inside a labelled group — the
 * active segment fills with the primary action colour.
 */
export function SearchModeToggleBase({
  mode,
  onModeChange,
}: SearchModeToggleBaseProps) {
  return (
    <HStack
      gap={1}
      p={1}
      bg="bg.surface"
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="full"
      boxShadow="e2"
      w="max-content"
      pointerEvents="auto"
    >
      {MODE_OPTIONS.map((option) => {
        const active = option.value === mode
        return (
          <Box
            key={option.value}
            as="button"
            aria-pressed={active}
            aria-label={`Search ${option.label.toLowerCase()}`}
            onClick={() => {
              if (!active) onModeChange(option.value)
            }}
            px={4}
            py={1.5}
            minH="36px"
            borderRadius="full"
            fontSize="sm"
            fontWeight={700}
            cursor="pointer"
            bg={active ? 'action.primary' : 'transparent'}
            color={active ? 'text.onGreen' : 'text.muted'}
            _hover={active ? undefined : { color: 'text.default' }}
            _focusVisible={sdlFocusRing}
            transitionProperty="background, color"
            transitionDuration={sdlMotion.duration.moderate}
            transitionTimingFunction={sdlMotion.easing.standard}
          >
            {option.label}
          </Box>
        )
      })}
    </HStack>
  )
}

/**
 * Mode toggle wired to the /search contexts. Switching modes preserves the
 * shared map viewport but clears the other mode's selection and closes the
 * filter panel (its fields are mode-specific).
 */
export function SearchModeToggle() {
  const { mode, setMode } = useSearchMode()
  const { setSelectedTaskId } = useTaskBrowseData()
  const { setIsFilterOpen } = useTaskBrowseLayout()
  const { setSelectedWorkerId } = useWorkerSearch()

  return (
    <SearchModeToggleBase
      mode={mode}
      onModeChange={(next) => {
        setIsFilterOpen(false)
        setSelectedTaskId(null)
        setSelectedWorkerId(null)
        setMode(next)
      }}
    />
  )
}
