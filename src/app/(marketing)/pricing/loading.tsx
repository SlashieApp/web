import { Container, SimpleGrid, Skeleton, Stack } from '@chakra-ui/react'

import { Footer } from '@ui'

/** Header, the two plan cards, then FAQ rows. */
export default function PricingLoading() {
  return (
    <>
      <Container as="section" py={{ base: 8, md: 12 }}>
        <Stack gap={{ base: 8, md: 10 }}>
          <Stack gap={3} align="center">
            <Skeleton h="36px" w="min(24rem, 80%)" />
            <Skeleton h="16px" w="min(32rem, 90%)" />
          </Stack>
          <SimpleGrid
            columns={{ base: 1, md: 2 }}
            gap={5}
            w="full"
            maxW="4xl"
            mx="auto"
          >
            <Skeleton h="440px" borderRadius="lg" />
            <Skeleton h="440px" borderRadius="lg" />
          </SimpleGrid>
          <Stack gap={3} w="full" maxW="4xl" mx="auto">
            <Skeleton h="24px" w="30%" />
            <Skeleton h="88px" borderRadius="xl" />
            <Skeleton h="88px" borderRadius="xl" />
            <Skeleton h="88px" borderRadius="xl" />
          </Stack>
        </Stack>
      </Container>
      <Footer />
    </>
  )
}
