import {
  Box,
  Container,
  Grid,
  SimpleGrid,
  Skeleton,
  Stack,
} from '@chakra-ui/react'

import {
  MarketingFrame,
  SECTION_PY,
  SectionRule,
} from '@/app/(marketing)/components/layout/MarketingFrame'
import { Footer } from '@ui'

import { PRICING_SPLIT } from './components/ui/layout/PricingSection'

/**
 * The page header's bar and the large title's room, then the plans section
 * (head, the two plan cards) and the questions (head, hairline rows), in the
 * same frame, rules and grid as the page.
 */
export default function PricingLoading() {
  return (
    <>
      <MarketingFrame bg="bg.surface">
        <Container>
          {/* The 56px bar and the large "Membership" 8px under it (FE-458). */}
          <Box h="56px" aria-hidden />
          <Skeleton
            h="41px"
            w="min(12rem, 60%)"
            mt={2}
            mb={{ base: 4, md: 6 }}
          />
        </Container>
        <SectionRule />
        <Box as="section" py={SECTION_PY}>
          <Container>
            <Grid {...PRICING_SPLIT}>
              <Stack gap={3}>
                <Skeleton h="41px" w="min(24rem, 90%)" />
                <Skeleton h="18px" w="min(32rem, 90%)" />
                <Skeleton h="18px" w="min(20rem, 60%)" />
              </Stack>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 4, md: 5 }}>
                <Skeleton h="440px" borderRadius="lg" />
                <Skeleton h="440px" borderRadius="lg" />
              </SimpleGrid>
            </Grid>
          </Container>
        </Box>
        <SectionRule />
        <Box as="section" py={SECTION_PY}>
          <Container>
            <Grid {...PRICING_SPLIT}>
              <Skeleton h="41px" w="min(14rem, 60%)" />
              <Stack gap={0}>
                <Skeleton h="88px" />
                <Skeleton h="88px" />
                <Skeleton h="88px" />
              </Stack>
            </Grid>
          </Container>
        </Box>
      </MarketingFrame>
      <Footer />
    </>
  )
}
