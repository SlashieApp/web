import { Box, SimpleGrid, Skeleton, Stack } from '@chakra-ui/react'

export function WorkersBrowseSkeleton() {
  return (
    <SimpleGrid
      columns={{ base: 1, md: 2, xl: 3 }}
      gap={{ base: 4, md: 5 }}
      w="full"
    >
      {(
        [
          'worker-skeleton-a',
          'worker-skeleton-b',
          'worker-skeleton-c',
          'worker-skeleton-d',
          'worker-skeleton-e',
          'worker-skeleton-f',
        ] as const
      ).map((key) => (
        <Stack
          key={key}
          align="center"
          gap={3}
          p={{ base: 5, md: 6 }}
          borderWidth="1px"
          borderColor="cardBorder"
          borderRadius="2xl"
          bg="cardBg"
        >
          <Skeleton boxSize="96px" borderRadius="full" />
          <Skeleton h="18px" w="55%" />
          <Skeleton h="14px" w="75%" />
          <Skeleton h="14px" w="40%" />
          <Skeleton h="14px" w="35%" />
        </Stack>
      ))}
    </SimpleGrid>
  )
}
