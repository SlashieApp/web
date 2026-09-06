'use client'

import { Skeleton, Text } from '@chakra-ui/react'

import { useTaskBrowseData } from '../../../context/TaskBrowseProvider'
import { formatTasksListTitle } from '../../helpers/searchResultsListTitle'

/** Web /search list heading — “24 tasks near London”. */
export function SearchResultsListTitle() {
  const { filteredSorted, loading, dataLoaded, referenceLocation } =
    useTaskBrowseData()

  if (loading && !dataLoaded) {
    return <Skeleton h="18px" w="11rem" borderRadius="md" flexShrink={0} />
  }

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
      {formatTasksListTitle(filteredSorted.length, referenceLocation.label)}
    </Text>
  )
}
