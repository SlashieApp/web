'use client'

import { HStack } from '@chakra-ui/react'
import { Button } from '@ui'

export type TaskListPaginationProps = {
  page: number
  totalPages: number
  onPrevious: () => void
  onNext: () => void
  onSelectPage: (pageIndex: number) => void
}

function PageBubble({
  pageIndex,
  active,
  onClick,
}: {
  pageIndex: number
  active: boolean
  onClick: () => void
}) {
  const label = String(pageIndex + 1)
  return (
    <Button
      type="button"
      variant="subtle"
      size="sm"
      minW="40px"
      h="40px"
      px={0}
      borderRadius="full"
      fontWeight={700}
      boxShadow="none"
      bg={active ? 'primary.500' : 'surfaceContainerHigh'}
      color={active ? 'white' : 'fg'}
      _hover={{
        bg: active ? 'primary.600' : 'surfaceContainerLowest',
      }}
      onClick={onClick}
      aria-label={`Page ${label}`}
      aria-current={active ? 'page' : undefined}
    >
      {label}
    </Button>
  )
}

export function TaskListPagination({
  page,
  totalPages,
  onPrevious,
  onNext,
  onSelectPage,
}: TaskListPaginationProps) {
  if (totalPages <= 1) return null

  const windowSize = 3
  let start = Math.max(0, page - 1)
  const end = Math.min(totalPages, start + windowSize)
  if (end - start < windowSize) {
    start = Math.max(0, end - windowSize)
  }
  const indices = Array.from({ length: end - start }, (_, i) => start + i)

  return (
    <HStack justify="center" gap={3} flexWrap="wrap" py={2}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        color="primary.600"
        fontWeight={600}
        disabled={page <= 0}
        onClick={onPrevious}
      >
        ← Previous
      </Button>
      <HStack gap={2}>
        {indices.map((i) => (
          <PageBubble
            key={i}
            pageIndex={i}
            active={i === page}
            onClick={() => onSelectPage(i)}
          />
        ))}
      </HStack>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        color="primary.600"
        fontWeight={600}
        disabled={page >= totalPages - 1}
        onClick={onNext}
      >
        Next →
      </Button>
    </HStack>
  )
}
