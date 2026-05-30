'use client'

import { Box, HStack, Heading, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useCallback } from 'react'

import { Button } from '@ui'

import { useTaskBrowseData } from '../context/TaskBrowseProvider'

const MAX_RADIUS_MILES = 50

type EmptyMode = 'loading' | 'noNearby' | 'filtered'

function EmptyStateIllustration() {
  return (
    <Box
      w="120px"
      h="104px"
      borderRadius="2xl"
      bg="primary.50"
      position="relative"
      display="grid"
      placeItems="center"
      aria-hidden
    >
      <svg
        width="92"
        height="80"
        viewBox="0 0 92 80"
        fill="none"
        role="img"
        aria-label="No tasks found illustration"
      >
        <title>No tasks found</title>
        <path
          d="M8 22 30 14 62 22 84 14v44L62 66 30 58 8 66V22Z"
          fill="#BFF3DC"
          stroke="#34D399"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M30 14v44M62 22v44"
          stroke="#34D399"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeDasharray="4 5"
        />
        <path
          d="M20 44c4-7 9-7 13 0M50 38c4-7 9-7 13 0"
          stroke="#10B981"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle
          cx="58"
          cy="50"
          r="15"
          fill="#ECFDF5"
          stroke="#00DC82"
          strokeWidth="3.5"
        />
        <path
          d="m69 61 9 9"
          stroke="#00DC82"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </Box>
  )
}

function ExpandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Expand</title>
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2v3M12 19v3M2 12h3M19 12h3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>List</title>
      <path
        d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Add</title>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * Polished empty-state card for the task browse experience. Reads browse state
 * directly and renders the right copy + actions for "no nearby tasks" vs
 * "filters exclude everything", with a loading variant while the first fetch is
 * in flight.
 */
export function TaskEmptyState() {
  const {
    loading,
    dataLoaded,
    browseSourceTaskCount,
    submittedRadiusMiles,
    setRadiusMiles,
    submitBrowseFilters,
    setSearchInput,
    setMinBudget,
    setMaxBudget,
    setUrgency,
  } = useTaskBrowseData()

  const mode: EmptyMode =
    loading && browseSourceTaskCount === 0 && !dataLoaded
      ? 'loading'
      : browseSourceTaskCount > 0
        ? 'filtered'
        : 'noNearby'

  const clearFilters = useCallback(() => {
    setSearchInput('')
    setMinBudget('')
    setMaxBudget('')
    setUrgency('any')
  }, [setMaxBudget, setMinBudget, setSearchInput, setUrgency])

  const expandRadius = useCallback(() => {
    const next = Math.min(
      MAX_RADIUS_MILES,
      Math.max(submittedRadiusMiles + 5, Math.round(submittedRadiusMiles * 2)),
    )
    setRadiusMiles(next)
    submitBrowseFilters()
  }, [setRadiusMiles, submitBrowseFilters, submittedRadiusMiles])

  const browseAll = useCallback(() => {
    clearFilters()
    setRadiusMiles(MAX_RADIUS_MILES)
    submitBrowseFilters()
  }, [clearFilters, setRadiusMiles, submitBrowseFilters])

  const handleClearFilters = useCallback(() => {
    clearFilters()
    submitBrowseFilters()
  }, [clearFilters, submitBrowseFilters])

  const atMaxRadius = submittedRadiusMiles >= MAX_RADIUS_MILES

  return (
    <Box
      bg="cardBg"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor="cardBorder"
      boxShadow="0 12px 32px rgba(15,23,42,0.16)"
      maxW="360px"
      w="full"
      mx="auto"
      px={{ base: 5, md: 6 }}
      py={{ base: 6, md: 7 }}
      pointerEvents="auto"
    >
      <Stack gap={4} align="center" textAlign="center">
        <EmptyStateIllustration />

        {mode === 'loading' ? (
          <Stack gap={1}>
            <Heading size="md" color="cardFg">
              Finding tasks near you…
            </Heading>
            <Text fontSize="sm" color="formLabelMuted">
              Hang tight while we load nearby tasks.
            </Text>
          </Stack>
        ) : mode === 'filtered' ? (
          <>
            <Stack gap={1}>
              <Heading size="md" color="cardFg">
                No tasks match your filters
              </Heading>
              <Text fontSize="sm" color="formLabelMuted">
                Try clearing your filters or widening your search area.
              </Text>
            </Stack>
            <Stack gap={2.5} w="full">
              <Button variant="primary" w="full" onClick={handleClearFilters}>
                <HStack gap={2}>
                  <ListIcon />
                  <span>Clear filters</span>
                </HStack>
              </Button>
              <HStack gap={2.5} w="full">
                {!atMaxRadius ? (
                  <Button variant="secondary" flex={1} onClick={expandRadius}>
                    <HStack gap={2}>
                      <ExpandIcon />
                      <span>Widen radius</span>
                    </HStack>
                  </Button>
                ) : null}
                <Link
                  as={NextLink}
                  href="/tasks/create"
                  flex={1}
                  _hover={{ textDecoration: 'none' }}
                >
                  <Button variant="secondary" w="full">
                    <HStack gap={2}>
                      <PlusIcon />
                      <span>Post a task</span>
                    </HStack>
                  </Button>
                </Link>
              </HStack>
            </Stack>
          </>
        ) : (
          <>
            <Stack gap={1}>
              <Heading size="md" color="cardFg">
                No nearby tasks right now
              </Heading>
              <Text fontSize="sm" color="formLabelMuted">
                Try expanding your search area or browse tasks in nearby towns.
              </Text>
            </Stack>
            <Stack gap={2.5} w="full">
              {!atMaxRadius ? (
                <Button variant="primary" w="full" onClick={expandRadius}>
                  <HStack gap={2}>
                    <ExpandIcon />
                    <span>Expand search radius</span>
                  </HStack>
                </Button>
              ) : null}
              <HStack gap={2.5} w="full">
                <Button variant="secondary" flex={1} onClick={browseAll}>
                  <HStack gap={2}>
                    <ListIcon />
                    <span>Browse all tasks</span>
                  </HStack>
                </Button>
                <Link
                  as={NextLink}
                  href="/tasks/create"
                  flex={1}
                  _hover={{ textDecoration: 'none' }}
                >
                  <Button variant="secondary" w="full">
                    <HStack gap={2}>
                      <PlusIcon />
                      <span>Post a task</span>
                    </HStack>
                  </Button>
                </Link>
              </HStack>
            </Stack>
          </>
        )}
      </Stack>
    </Box>
  )
}
