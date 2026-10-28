'use client'

import { Box, HStack, Spinner } from '@chakra-ui/react'
import { Button, Input } from '@ui'
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { LuLocateFixed, LuSearch, LuX } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { sdlFocusRing } from '@/theme/styles'

import {
  useTaskBrowseData,
  useTaskBrowseLayout,
} from '../../context/TaskBrowseProvider'
import bag from '../i11n.json'

export type TaskSearchBaseProps = {
  value: string
  /** `input` types the search; `trigger` is a read-only bar that opens the search sheet. */
  mode: 'input' | 'trigger'
  /** Typed text not applied yet, or results loading: inline spinner. */
  pending?: boolean
  autoFocus?: boolean
  onValueChange: (value: string) => void
  /** Enter: apply the typed text now. */
  onCommit: () => void
  onClear: () => void
  /** `trigger` mode: press / Enter / Space. */
  onOpen?: () => void
  /** Moves the nearest-first sort centre to the visitor (map search only). */
  onUseCurrentLocation?: () => void
  copy: {
    placeholder: string
    clearSearch: string
    useCurrentLocation?: string
  }
}

function SearchFieldButton({
  label,
  onPress,
  children,
}: {
  label: string
  onPress: () => void
  children: ReactNode
}) {
  return (
    <Button
      type="button"
      aria-label={label}
      title={label}
      display="flex"
      alignItems="center"
      justifyContent="center"
      minW={0}
      w={8}
      h={8}
      px={0}
      py={0}
      variant="ghost"
      color="text.muted"
      _hover={{ bg: 'bg.subtle', color: 'text.default' }}
      _focusVisible={sdlFocusRing}
      // Keep focus in the field and keep the trigger bar from opening.
      onMouseDown={(e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        onPress()
      }}
    >
      {children}
    </Button>
  )
}

function isFromFieldButton(target: EventTarget | null) {
  return target instanceof Element && target.closest('button') != null
}

/**
 * Task search bar (FE-201). The map moves with panning and "Search this
 * area"; this field only searches task text.
 */
export function TaskSearchBase({
  value,
  mode,
  pending = false,
  autoFocus = false,
  onValueChange,
  onCommit,
  onClear,
  onOpen,
  onUseCurrentLocation,
  copy,
}: TaskSearchBaseProps) {
  const endElement = (
    <HStack gap={0.5}>
      {pending ? (
        <Spinner size="xs" color="action.primary" aria-hidden mx={1} />
      ) : null}
      {value && mode === 'input' ? (
        <SearchFieldButton label={copy.clearSearch} onPress={onClear}>
          <LuX size={16} strokeWidth={2} aria-hidden />
        </SearchFieldButton>
      ) : null}
      {onUseCurrentLocation && copy.useCurrentLocation ? (
        <SearchFieldButton
          label={copy.useCurrentLocation}
          onPress={onUseCurrentLocation}
        >
          <LuLocateFixed size={18} strokeWidth={2} aria-hidden />
        </SearchFieldButton>
      ) : null}
    </HStack>
  )
  const startElement = (
    <Box as="span" aria-hidden display="inline-flex" pointerEvents="none">
      <LuSearch size={18} strokeWidth={2} />
    </Box>
  )

  if (mode === 'trigger') {
    return (
      <Input
        pill
        rootProps={{
          cursor: 'pointer',
          onMouseDown: (e: MouseEvent<HTMLDivElement>) => {
            if (isFromFieldButton(e.target)) return
            e.preventDefault()
            onOpen?.()
          },
        }}
        startElement={startElement}
        endElement={endElement}
        readOnly
        tabIndex={0}
        aria-haspopup="dialog"
        aria-label={copy.placeholder}
        value={value}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key !== 'Enter' && e.key !== ' ') return
          e.preventDefault()
          onOpen?.()
        }}
        type="text"
        autoComplete="off"
        cursor="pointer"
        placeholder={copy.placeholder}
      />
    )
  }

  return (
    <Input
      pill
      startElement={startElement}
      endElement={endElement}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') return
        e.preventDefault()
        onCommit()
      }}
      type="search"
      enterKeyHint="search"
      autoComplete="off"
      autoFocus={autoFocus}
      placeholder={copy.placeholder}
      aria-label={copy.placeholder}
    />
  )
}

export function TaskSearch({
  mode,
  autoFocus,
}: {
  mode: 'input' | 'trigger'
  autoFocus?: boolean
}) {
  const t = useI11n(bag)
  const {
    searchInput,
    searchText,
    setSearchInput,
    commitSearch,
    isSearchPending,
    removeBrowseFilterTag,
    requestUseMyLocation,
  } = useTaskBrowseData()
  const { setIsFilterOpen } = useTaskBrowseLayout()

  return (
    <Box pointerEvents="auto">
      <TaskSearchBase
        mode={mode}
        value={mode === 'trigger' ? searchText : searchInput}
        pending={isSearchPending}
        autoFocus={autoFocus}
        onValueChange={setSearchInput}
        onCommit={commitSearch}
        onClear={() => removeBrowseFilterTag({ kind: 'search', label: '' })}
        onOpen={() => setIsFilterOpen(true)}
        onUseCurrentLocation={requestUseMyLocation}
        copy={{
          placeholder: t.searchPlaceholder,
          clearSearch: t.clearSearch,
          useCurrentLocation: t.useCurrentLocation,
        }}
      />
    </Box>
  )
}
