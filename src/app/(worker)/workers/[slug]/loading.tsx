import { Box, Container, Grid, Skeleton, Stack } from '@chakra-ui/react'

import { Footer } from '@ui'

/** Skeleton mirroring the v2 layout: hero band + 65/35 two-column body. */
export default function WorkerProfileLoading() {
  return (
    <>
      <Box as="section" py={{ base: 5, md: 8 }}>
        <Container maxW="8xl" px={{ base: 4, md: 8 }}>
          <Stack gap={{ base: 4, md: 5 }}>
            <Skeleton h="18px" w="90px" />
            <HeroSkeleton />
            <Grid
              templateColumns={{
                base: 'minmax(0, 1fr)',
                lg: 'minmax(0, 65fr) minmax(0, 35fr)',
              }}
              gap={{ base: 5, lg: 6 }}
              alignItems="start"
            >
              <Stack gap={{ base: 5, lg: 6 }}>
                <SectionSkeleton lines={3} />
                <SectionSkeleton lines={2} />
                <SectionSkeleton lines={4} />
              </Stack>
              <Stack gap={5}>
                <SectionSkeleton lines={3} />
                <SectionSkeleton lines={2} />
              </Stack>
            </Grid>
          </Stack>
        </Container>
      </Box>
      <Footer />
    </>
  )
}

function HeroSkeleton() {
  return (
    <Stack
      direction={{ base: 'column', md: 'row' }}
      gap={{ base: 4, md: 6 }}
      align="flex-start"
      p={{ base: 5, md: 8 }}
      borderRadius="2xl"
      borderWidth="1px"
      borderColor="border.default"
      bg="bg.surface"
    >
      <Skeleton boxSize="96px" borderRadius="full" flexShrink={0} />
      <Stack gap={3} flex={1} w="full">
        <Skeleton h="30px" w="45%" />
        <Skeleton h="18px" w="60%" />
        <Skeleton h="16px" w="70%" />
        <Skeleton h="16px" w="50%" />
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
