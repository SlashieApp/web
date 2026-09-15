'use client'

import { HStack, Skeleton, Stack } from '@chakra-ui/react'

import { Card } from '@ui'

/** Task-card-shaped placeholder used while browse/search results load. */
export function TaskCardSkeleton() {
  return (
    <Card p={3} maxW="full" aria-hidden>
      <HStack gap={{ base: 3, md: 3.5 }} align="stretch">
        <Skeleton
          minW={{ base: '72px', md: '80px' }}
          h={{ base: '72px', md: '80px' }}
          borderRadius="lg"
          flexShrink={0}
        />
        <Stack flex={1} minW={0} gap={2} justify="center">
          <Skeleton h="12px" w="30%" borderRadius="full" />
          <Skeleton h="16px" w="78%" borderRadius="md" />
          <Skeleton h="12px" w="52%" borderRadius="md" />
        </Stack>
      </HStack>
    </Card>
  )
}
