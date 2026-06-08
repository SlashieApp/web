import { Box, Container, Skeleton, Stack } from '@chakra-ui/react'

import { Footer } from '@ui'

export default function WorkerProfileLoading() {
  return (
    <>
      <Box as="section" py={{ base: 6, md: 10 }}>
        <Container>
          <Stack gap={6} maxW="3xl" mx="auto" px={{ base: 4, md: 6 }}>
            <Stack
              gap={4}
              p={{ base: 4, md: 6 }}
              borderRadius="xl"
              borderWidth="1px"
              borderColor="cardBorder"
              bg="cardBg"
            >
              <HStackSkeleton />
              <Skeleton h="20px" w="40%" />
              <Skeleton h="16px" w="55%" />
            </Stack>
            <SectionSkeleton lines={3} />
            <Stack gap={3}>
              <Skeleton h="20px" w="30%" />
              <Skeleton h="88px" borderRadius="lg" />
              <Skeleton h="88px" borderRadius="lg" />
            </Stack>
            <SectionSkeleton lines={2} />
            <SectionSkeleton lines={4} />
          </Stack>
        </Container>
      </Box>
      <Footer />
    </>
  )
}

function HStackSkeleton() {
  return (
    <Stack direction={{ base: 'column', md: 'row' }} gap={4} align="flex-start">
      <Skeleton
        boxSize={{ base: '72px', md: '88px' }}
        borderRadius="full"
        flexShrink={0}
      />
      <Stack gap={2} flex={1} w="full">
        <Skeleton h="12px" w="28%" />
        <Skeleton h="28px" w="55%" />
        <Skeleton h="16px" w="45%" />
      </Stack>
    </Stack>
  )
}

function SectionSkeleton({ lines }: { lines: 2 | 3 | 4 }) {
  return (
    <Stack
      gap={4}
      p={{ base: 5, md: 6 }}
      borderRadius="xl"
      borderWidth="1px"
      borderColor="cardBorder"
      bg="cardBg"
    >
      <Skeleton h="12px" w="20%" />
      <Skeleton h="24px" w="40%" />
      <Skeleton h="16px" w="full" />
      {lines >= 3 ? <Skeleton h="16px" w="full" /> : null}
      {lines >= 4 ? <Skeleton h="16px" w="full" /> : null}
      <Skeleton h="16px" w="70%" />
    </Stack>
  )
}
