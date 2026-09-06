import { Box, Container, Grid, Stack } from '@chakra-ui/react'

import { Footer } from '@ui'

import {
  WorkerProfileHeroIdentitySkeleton,
  WorkerProfileSectionSkeleton,
} from './components/shared/WorkerProfileSkeletons'

/** Skeleton mirroring the v2 layout: hero band + 65/35 two-column body. */
export default function WorkerProfileLoading() {
  return (
    <>
      <Box as="section" py={{ base: 5, md: 8 }}>
        <Container>
          <Stack gap={{ base: 4, md: 5 }}>
            <WorkerProfileHeroIdentitySkeleton />
            <Grid
              templateColumns={{
                base: 'minmax(0, 1fr)',
                lg: 'minmax(0, 65fr) minmax(0, 35fr)',
              }}
              gap={{ base: 5, lg: 6 }}
              alignItems="start"
            >
              <Stack gap={{ base: 5, lg: 6 }}>
                <WorkerProfileSectionSkeleton lines={3} />
                <WorkerProfileSectionSkeleton lines={2} />
                <WorkerProfileSectionSkeleton lines={4} />
              </Stack>
              <Stack gap={5}>
                <WorkerProfileSectionSkeleton lines={3} />
                <WorkerProfileSectionSkeleton lines={2} />
              </Stack>
            </Grid>
          </Stack>
        </Container>
      </Box>
      <Footer />
    </>
  )
}
