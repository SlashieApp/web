import { Box, HStack, Skeleton, Stack } from '@chakra-ui/react'

/** Card-shaped placeholder matching TaskCard anatomy while browse data loads. */
export function TaskCardSkeleton() {
  return (
    <Box
      p={3}
      w="full"
      maxW="full"
      bg="bg.surface"
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="lg"
      boxShadow="e1"
    >
      <HStack gap={3} align="stretch">
        <Skeleton
          boxSize={{ base: '72px', md: '80px' }}
          borderRadius="md"
          flexShrink={0}
        />
        <Stack flex={1} gap={1.5} minW={0} justify="center">
          <Skeleton h="14px" w="28%" borderRadius="full" />
          <Skeleton h="18px" w="82%" borderRadius="md" />
          <Skeleton h="14px" w="52%" borderRadius="md" />
        </Stack>
      </HStack>
    </Box>
  )
}
