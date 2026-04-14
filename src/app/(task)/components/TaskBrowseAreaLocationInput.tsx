'use client'

import { Box, Input } from '@chakra-ui/react'

import { useTaskBrowseData } from '../context/TaskBrowseProvider'

/**
 * Area / “near you” search field wired to {@link useTaskBrowseData} (no props
 * drilling from layouts). Styles follow breakpoint: compact field on small
 * screens, taller field + search icon from `md` up.
 */
export function TaskBrowseAreaLocationInput() {
  const { areaLocationInput, setAreaLocationInput, commitAreaLocationSearch } =
    useTaskBrowseData()

  return (
    <Box position="relative">
      <Box
        display={{ base: 'none', md: 'block' }}
        position="absolute"
        left={3}
        top="50%"
        transform="translateY(-50%)"
        color="muted"
        pointerEvents="none"
        zIndex={1}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <title>Search</title>
          <path
            d="M11 19a8 8 0 1 1 5.3-14l5.1 5.1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="m20 20-3.3-3.3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </Box>
      <Input
        value={areaLocationInput}
        onChange={(e) => setAreaLocationInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== 'Enter') return
          e.preventDefault()
          e.currentTarget.blur()
        }}
        type="search"
        bg="surfaceContainerLowest"
        onBlur={commitAreaLocationSearch}
        placeholder="Find pros or jobs near you..."
        borderRadius={{ base: 'lg', md: 'xl' }}
        h={{ base: 10, md: 11 }}
        ps={10}
        pointerEvents="auto"
      />
    </Box>
  )
}
