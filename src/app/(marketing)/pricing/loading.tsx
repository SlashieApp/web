import { Box, Container, SimpleGrid, Skeleton, Stack } from '@chakra-ui/react'

import { Footer } from '@ui'

export default function PricingLoading() {
  return (
    <>
      <Box as="section" py={{ base: 8, md: 12 }}>
        <Container maxW="5xl" px={{ base: 4, md: 6 }}>
          <Stack gap={8}>
            <Stack gap={3} align="center" textAlign="center">
              <Skeleton h="12px" w="24%" />
              <Skeleton h="36px" w="40%" />
              <Skeleton h="16px" w="70%" />
            </Stack>
            <Skeleton h="72px" w="full" borderRadius="xl" />
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
              <Skeleton h="360px" borderRadius="2xl" />
              <Skeleton h="360px" borderRadius="2xl" />
            </SimpleGrid>
            <Stack gap={3}>
              <Skeleton h="24px" w="30%" />
              <Skeleton h="80px" borderRadius="xl" />
              <Skeleton h="80px" borderRadius="xl" />
              <Skeleton h="80px" borderRadius="xl" />
            </Stack>
          </Stack>
        </Container>
      </Box>
      <Footer />
    </>
  )
}
