'use client'

import { IconButton } from '@chakra-ui/react'

export type TaskBrowseMapHeroFiltersIconButtonProps = {
  onOpenFilters: () => void
}

export function TaskBrowseMapHeroFiltersIconButton({
  onOpenFilters,
}: TaskBrowseMapHeroFiltersIconButtonProps) {
  return (
    <IconButton
      aria-label="Open filters"
      position="absolute"
      zIndex={4}
      top={20}
      right={3}
      borderRadius="full"
      bg="surfaceContainerLowest"
      color="primary.700"
      boxShadow="0 8px 24px rgba(15,23,42,0.2)"
      borderWidth="1px"
      borderColor="border"
      onClick={onOpenFilters}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <title>Filters</title>
        <path
          d="M4 7H20M7 12H17M10 17H14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </IconButton>
  )
}
