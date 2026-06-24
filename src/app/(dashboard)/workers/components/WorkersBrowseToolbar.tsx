'use client'

import { Box, HStack, Text } from '@chakra-ui/react'
import { useCallback, useRef, useState } from 'react'
import { LuMapPin, LuSearch, LuShieldCheck, LuStar } from 'react-icons/lu'

import { Input } from '@ui'

export type WorkersBrowseFilters = {
  search: string
  verifiedOnly: boolean
  nearMe: boolean
}

type WorkersBrowseToolbarProps = {
  filters: WorkersBrowseFilters
  nearMeAvailable: boolean
  onFiltersChange: (patch: Partial<WorkersBrowseFilters>) => void
}

const SEARCH_DEBOUNCE_MS = 300

function FilterChip({
  label,
  icon,
  active,
  disabled,
  onClick,
}: {
  label: string
  icon: React.ReactNode
  active?: boolean
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <Box
      as="button"
      display="inline-flex"
      alignItems="center"
      gap={1.5}
      px={3}
      py={1.5}
      borderRadius="full"
      borderWidth="1px"
      borderColor={active ? 'action.primary' : 'border.default'}
      bg={active ? 'status.success.soft' : 'bg.surface'}
      color={
        disabled ? 'text.muted' : active ? 'status.success.fg' : 'text.default'
      }
      fontSize="sm"
      fontWeight={600}
      opacity={disabled ? 0.55 : 1}
      cursor={disabled ? 'not-allowed' : 'pointer'}
      flexShrink={0}
      onClick={disabled ? undefined : onClick}
      aria-pressed={active}
      aria-disabled={disabled}
    >
      <Box as="span" color="text.link" display="inline-flex" aria-hidden>
        {icon}
      </Box>
      {label}
    </Box>
  )
}

export function WorkersBrowseToolbar({
  filters,
  nearMeAvailable,
  onFiltersChange,
}: WorkersBrowseToolbarProps) {
  const [searchInput, setSearchInput] = useState(filters.search)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const onSearchInputChange = useCallback(
    (value: string) => {
      setSearchInput(value)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onFiltersChange({ search: value })
      }, SEARCH_DEBOUNCE_MS)
    },
    [onFiltersChange],
  )

  return (
    <Box
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="xl"
      bg="bg.surface"
      p={{ base: 3, md: 4 }}
      boxShadow="e2"
    >
      <HStack
        gap={{ base: 3, md: 4 }}
        align={{ base: 'stretch', md: 'center' }}
        flexDirection={{ base: 'column', md: 'row' }}
      >
        <Box flex={1} minW={0}>
          <Input
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            placeholder="Search by name, skill, or area…"
            aria-label="Search workers"
            startElement={
              <Box color="text.muted" pl={2} display="flex" aria-hidden>
                <LuSearch size={18} />
              </Box>
            }
            border="none"
            bg="transparent"
            _focus={{ boxShadow: 'none' }}
            rootProps={{ w: 'full', pl: 0 }}
          />
        </Box>
        <HStack
          gap={2}
          flexWrap="wrap"
          justify={{ base: 'flex-start', md: 'flex-end' }}
        >
          <FilterChip
            label="Verified"
            icon={<LuShieldCheck size={16} />}
            active={filters.verifiedOnly}
            onClick={() =>
              onFiltersChange({ verifiedOnly: !filters.verifiedOnly })
            }
          />
          <FilterChip
            label="Near me"
            icon={<LuMapPin size={16} />}
            active={filters.nearMe}
            disabled={!nearMeAvailable}
            onClick={() => onFiltersChange({ nearMe: !filters.nearMe })}
          />
          <FilterChip label="Top rated" icon={<LuStar size={16} />} disabled />
        </HStack>
      </HStack>
      {!nearMeAvailable ? (
        <Text fontSize="xs" color="text.muted" mt={2}>
          Set a service area with map coordinates on your worker profile to use
          Near me.
        </Text>
      ) : null}
    </Box>
  )
}
