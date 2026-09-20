import { Skeleton, Stack } from '@chakra-ui/react'

/** Section-card placeholder while the client profile query is in flight. */
export function WorkerProfileSectionSkeleton({
  lines = 3,
}: {
  lines?: 2 | 3 | 4
}) {
  return (
    <Stack
      gap={4}
      p={{ base: 5, md: 6 }}
      borderRadius="xl"
      borderWidth="1px"
      borderColor="border.default"
      bg="bg.surface"
    >
      <Skeleton h="24px" w="40%" />
      <Skeleton h="16px" w="full" />
      {lines >= 3 ? <Skeleton h="16px" w="full" /> : null}
      {lines >= 4 ? <Skeleton h="16px" w="full" /> : null}
      <Skeleton h="16px" w="70%" />
    </Stack>
  )
}

/** Avatar + identity lines used by the loading route and a seed-less hero. */
export function WorkerProfileHeroIdentitySkeleton() {
  return (
    <Stack
      direction={{ base: 'column', md: 'row' }}
      gap={{ base: 4, md: 6 }}
      align={{ base: 'center', md: 'flex-start' }}
    >
      <Skeleton boxSize="96px" borderRadius="full" flexShrink={0} />
      <Stack
        gap={3}
        flex={1}
        w="full"
        align={{ base: 'center', md: 'stretch' }}
      >
        <Skeleton h="30px" w="45%" />
        <Skeleton h="18px" w="60%" />
        <Skeleton h="16px" w="70%" />
        <Skeleton h="16px" w="50%" />
      </Stack>
    </Stack>
  )
}
