import { Box, Container, HStack, Skeleton, Stack } from '@chakra-ui/react'

import {
  PAGE_CONTAINER_MAX_W,
  PAGE_GUTTER_X,
  SEARCH_LIST_COLUMN_W,
} from '@/theme/pageContainer'

import { TaskCardSkeleton } from '../../components/TaskCardSkeleton'

/**
 * Layout-matching placeholder for /search while the route or first tasks
 * query is in flight — list/carousel cards, not a lone spinner over the map.
 */
export function SearchLoadingSkeleton() {
  return (
    <Box
      flex={1}
      w="full"
      minH={0}
      h="full"
      position="relative"
      overflow="hidden"
      bg="bg.subtle"
      aria-busy="true"
      aria-label="Loading search"
    >
      <Box
        position="absolute"
        inset={0}
        bgImage="radial-gradient(48rem 28rem at 70% 40%, rgba(0, 220, 130, 0.08) 0%, transparent 70%)"
        aria-hidden
      />

      <Box
        display={{ base: 'none', lg: 'flex' }}
        position="absolute"
        inset={0}
        zIndex={1}
        justifyContent="center"
        pointerEvents="none"
      >
        <Container
          maxW={PAGE_CONTAINER_MAX_W}
          px={PAGE_GUTTER_X}
          h="full"
          w="full"
        >
          <Box
            py={2}
            w={SEARCH_LIST_COLUMN_W}
            maxW={SEARCH_LIST_COLUMN_W}
            h="full"
          >
            <Stack gap={3} h="full">
              <Skeleton h="48px" w="full" borderRadius="lg" />
              <HStack gap={2}>
                <Skeleton h="28px" w="72px" borderRadius="full" />
                <Skeleton h="28px" w="88px" borderRadius="full" />
                <Skeleton h="28px" w="64px" borderRadius="full" />
              </HStack>
              <Skeleton h="18px" w="11rem" borderRadius="md" />
              <Stack gap={3} flex={1}>
                <TaskCardSkeleton />
                <TaskCardSkeleton />
                <TaskCardSkeleton />
                <TaskCardSkeleton />
              </Stack>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Box display={{ base: 'block', lg: 'none' }} h="full" position="relative">
        <Box
          position="absolute"
          top={3}
          left={0}
          right={0}
          zIndex={1}
          pointerEvents="none"
        >
          <Container maxW={PAGE_CONTAINER_MAX_W} px={PAGE_GUTTER_X} w="full">
            <Stack gap={2} mr={12}>
              <Skeleton h="48px" w="full" borderRadius="lg" />
              <HStack gap={2}>
                <Skeleton h="28px" w="72px" borderRadius="full" />
                <Skeleton h="28px" w="88px" borderRadius="full" />
              </HStack>
            </Stack>
          </Container>
        </Box>
        <Box
          position="absolute"
          left={0}
          right={0}
          bottom={0}
          px={{ base: 2, md: 3 }}
          pb={2}
        >
          <TaskCardSkeleton />
        </Box>
      </Box>
    </Box>
  )
}
