'use client'

import { Box } from '@chakra-ui/react'
import { Button, Input } from '@ui'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { LuLocateFixed, LuSearch } from 'react-icons/lu'

import { useTaskBrowseData } from '../context/TaskBrowseProvider'

/**
 * Area / “near you” search field wired to {@link useTaskBrowseData} (no props
 * drilling from layouts). Built from the shared {@link Input} shell.
 */
export type TaskBrowseAreaLocationInputBaseProps = {
  value: string
  onValueChange: (value: string) => void
  onCommit: () => void
}

export function TaskBrowseAreaLocationInputBase({
  value,
  onValueChange,
  onCommit,
}: TaskBrowseAreaLocationInputBaseProps) {
  return (
    <Input
      startElement={
        <Box as="span" aria-hidden display="inline-flex">
          <LuSearch size={18} strokeWidth={2} />
        </Box>
      }
      endElement={
        <Button
          aria-label="Use current location"
          title="Use current location"
          display="flex"
          alignItems="center"
          justifyContent="center"
          minW={0}
          w={8}
          h={8}
          px={0}
          py={0}
          borderRadius="lg"
          variant="ghost"
          color="formControlIcon"
          _hover={{ bg: 'badgeBg', color: 'cardFg' }}
          _focusVisible={{
            outline: '2px solid',
            outlineColor: 'secondary',
            outlineOffset: '2px',
          }}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (!navigator.geolocation) return
            navigator.geolocation.getCurrentPosition((position) => {
              const lat = position.coords.latitude.toFixed(5)
              const lng = position.coords.longitude.toFixed(5)
              onValueChange(`${lat}, ${lng}`)
              onCommit()
            })
          }}
        >
          <LuLocateFixed size={18} strokeWidth={2} aria-hidden />
        </Button>
      }
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) =>
        onValueChange(e.target.value)
      }
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') return
        e.preventDefault()
        e.currentTarget.blur()
      }}
      type="text"
      inputMode="search"
      autoComplete="off"
      onBlur={onCommit}
      placeholder="London, UK"
    />
  )
}

export function TaskBrowseAreaLocationInput() {
  const { areaLocationInput, setAreaLocationInput, commitAreaLocationSearch } =
    useTaskBrowseData()

  return (
    <TaskBrowseAreaLocationInputBase
      value={areaLocationInput}
      onValueChange={setAreaLocationInput}
      onCommit={commitAreaLocationSearch}
    />
  )
}
