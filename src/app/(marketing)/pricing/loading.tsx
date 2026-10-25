import { Box, Container, SimpleGrid, Skeleton, Stack } from '@chakra-ui/react'

import { Footer } from '@ui'

/** The title bar's room, header, the two plan cards, then FAQ rows. */
export default function PricingLoading() {
  return (
    <>
      <Container as="section" pb={{ base: 8, md: 12 }}>
        {/* The 44px title bar (FE-420). */}
        <Box h="44px" aria-hidden />
        <Stack gap={{ base: 8, md: 10 }} pt={{ base: 8, md: 12 }}>
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
