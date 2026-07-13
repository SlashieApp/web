'use client'

import { Skeleton, Text } from '@chakra-ui/react'

import { useTaskBrowseData } from '../../context/TaskBrowseProvider'
import { useWorkerSearch } from '../context/WorkerSearchProvider'
import type { SearchMode } from '../helpers/searchQueryParams'
import {
  formatTasksListTitle,
  formatWorkersListTitle,
} from '../helpers/searchResultsListTitle'

export type SearchResultsListTitleProps = {
  mode: SearchMode
}

/**
 * Web /search list heading — “24 tasks near London” or “18 workers serving
 * this area”, shown above the scrollable result cards.
 */
export function SearchResultsListTitle({ mode }: SearchResultsListTitleProps) {
  if (mode === 'workers') {
    return <WorkersListTitle />
  }
  return <TasksListTitle />
}

function TasksListTitle() {
  const { filteredSorted, loading, dataLoaded, referenceLocation } =
    useTaskBrowseData()

  if (loading && !dataLoaded) {
    return <SearchListTitleSkeleton />
  }

  const title = formatTasksListTitle(
    filteredSorted.length,
    referenceLocation.label,
  )

  return <SearchListTitleText>{title}</SearchListTitleText>
}

function WorkersListTitle() {
  const { workers, loading, dataLoaded } = useWorkerSearch()

  if (loading && !dataLoaded) {
    return <SearchListTitleSkeleton />
  }

  const title = formatWorkersListTitle(workers.length)
  return <SearchListTitleText>{title}</SearchListTitleText>
}

function SearchListTitleSkeleton() {
  return <Skeleton h="18px" w="11rem" borderRadius="md" flexShrink={0} />
}

function SearchListTitleText({ children }: { children: string }) {
  return (
    <Text
      as="h2"
      fontSize="sm"
      fontWeight={600}
      color="text.default"
      letterSpacing="-0.01em"
      flexShrink={0}
      px={0.5}
    >
      {children}
    </Text>
  )
}
