'use client'

import { Box } from '@chakra-ui/react'
import { Button, Input } from '@ui'
import { useRef } from 'react'
import type { ChangeEvent, KeyboardEvent, MouseEvent } from 'react'
import { LuLocateFixed, LuSearch } from 'react-icons/lu'

import {
  useTaskBrowseData,
  useTaskBrowseLayout,
} from '../context/TaskBrowseProvider'

export type TaskSearchBaseProps = {
  value: string
  /** When filters are closed, the bar acts as a filter trigger; when open, it is a normal location field. */
  filtersOpen: boolean
  onValueChange: (value: string) => void
  /** Used when {@link filtersOpen} is false (click / Space / Enter on the shell). */
  onActivateFilters: () => void
  /** Used when {@link filtersOpen} is true (blur / Enter after blur). */
  onCommitLocationSearch: () => void
  /** GPS → reverse geocode → update center + label (handled in {@link TaskSearch}). */
  onUseCurrentLocation: () => void
}

function isFromLocateControl(target: EventTarget | null) {
  return target instanceof Element && target.closest('button') != null
}

/**
 * Location bar: closed filters → read-only, opens filters on press; open filters
 * → normal typing + commit via {@link onCommitLocationSearch}.
 */
export function TaskSearchBase({
  value,
  filtersOpen,
  onValueChange,
  onActivateFilters,
  onCommitLocationSearch,
  onUseCurrentLocation,
}: TaskSearchBaseProps) {
  const fieldRef = useRef<HTMLInputElement>(null)
  const prevFiltersOpenRef = useRef(false)

  if (filtersOpen && !prevFiltersOpenRef.current) {
    queueMicrotask(() => {
      fieldRef.current?.focus()
    })
  }
  prevFiltersOpenRef.current = filtersOpen

  if (filtersOpen) {
    return (
      <Input
        ref={fieldRef}
        startElement={
          <Box as="span" aria-hidden display="inline-flex">
            <LuSearch size={18} strokeWidth={2} />
          </Box>
        }
        endElement={
          <Button
            type="button"
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
            onMouseDown={(e: MouseEvent<HTMLButtonElement>) => {
              e.preventDefault()
            }}
            onClick={() => {
              void onUseCurrentLocation()
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
        onBlur={onCommitLocationSearch}
        placeholder="London, UK"
        aria-label="Search by area or address"
      />
    )
  }

  return (
    <Input
      rootProps={{
        cursor: 'pointer',
        onMouseDown: (e: MouseEvent<HTMLDivElement>) => {
          if (isFromLocateControl(e.target)) return
          e.preventDefault()
          onActivateFilters()
        },
      }}
      startElement={
        <Box as="span" aria-hidden display="inline-flex" pointerEvents="none">
          <LuSearch size={18} strokeWidth={2} />
        </Box>
      }
      endElement={
        <Button
          type="button"
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
          onMouseDown={(e: MouseEvent<HTMLButtonElement>) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation()
            void onUseCurrentLocation()
          }}
        >
          <LuLocateFixed size={18} strokeWidth={2} aria-hidden />
        </Button>
      }
      readOnly
      tabIndex={0}
      aria-haspopup="dialog"
      aria-label="Open filters"
      value={value}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter' && e.key !== ' ') return
        e.preventDefault()
        onActivateFilters()
      }}
      type="text"
      inputMode="search"
      autoComplete="off"
      cursor="pointer"
      placeholder="London, UK"
    />
  )
}

export function TaskSearch() {
  const {
    areaLocationInput,
    setAreaLocationInput,
    commitAreaLocationSearch,
    applyGeolocatedSearch,
    syncDraftFiltersFromSubmitted,
  } = useTaskBrowseData()
  const { isFilterOpen, setIsFilterOpen } = useTaskBrowseLayout()

  const onUseCurrentLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude
      const lng = position.coords.longitude
      void applyGeolocatedSearch(lat, lng)
    })
  }

  return (
    <TaskSearchBase
      value={areaLocationInput}
      filtersOpen={isFilterOpen}
      onValueChange={setAreaLocationInput}
      onActivateFilters={() => {
        if (!isFilterOpen) syncDraftFiltersFromSubmitted()
        setIsFilterOpen(!isFilterOpen)
      }}
      onCommitLocationSearch={commitAreaLocationSearch}
      onUseCurrentLocation={onUseCurrentLocation}
    />
  )
}
