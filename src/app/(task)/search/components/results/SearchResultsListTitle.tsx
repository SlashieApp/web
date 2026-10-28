'use client'

import { Skeleton, Text } from '@chakra-ui/react'

import { useTaskBrowseData } from '../../../context/TaskBrowseProvider'
import { formatTasksListTitle } from '../../helpers/searchResultsListTitle'

/** /search list heading: “24 tasks near London”, or “100+” with more pages. */
export function SearchResultsListTitle() {
  const {
    filteredSorted,
    isInitialTasksLoad,
    hasMoreTasks,
    referenceLocation,
  } = useTaskBrowseData()

  if (isInitialTasksLoad) {
    return <Skeleton h="18px" w="11rem" borderRadius="md" flexShrink={0} />
  }

  return (
    <Text
      as="h2"
      fontSize="sm"
      fontWeight={500}
      color="text.default"
      letterSpacing="-0.01em"
      flexShrink={0}
      px={0.5}
    >
      {formatTasksListTitle(
        filteredSorted.length,
        referenceLocation.label,
        hasMoreTasks,
      )}
    </Text>
  )
}
