import { Box, Grid, SimpleGrid, Skeleton, Stack } from '@chakra-ui/react'

import {
  MarketingFrame,
  SECTION_PY,
  SectionRule,
} from '@/app/(marketing)/components/layout/MarketingFrame'
import { HERO_PB_BARE } from '@/app/(marketing)/components/ui/landing/hero/HeroSection'
import { PageContainer } from '@/ui/PageContainer'
import { Footer } from '@ui'

import { PRICING_SPLIT } from './components/ui/layout/PricingSection'

/**
 * The page's shape while it loads (FE-552): the centred headline and body,
 * the two plan cards under them, then the counting cells and the questions,
 * in the same frame and rules as the page.
 */
export default function PricingLoading() {
  return (
    <>
      <MarketingFrame bg="bg.surface">
        <Box as="section" pt={SECTION_PY} pb={HERO_PB_BARE}>
          <PageContainer>
            <Stack gap={{ base: 10, md: 14 }} mx="auto" maxW="64rem">
              <Stack gap={{ base: 5, md: 6 }} align="center">
                <Skeleton
                  h={{ base: '48px', md: '72px' }}
                  w="min(36rem, 90%)"
                />
                <Skeleton h="22px" w="min(28rem, 80%)" />
              </Stack>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 4, md: 5 }}>
                <Skeleton h="440px" borderRadius="lg" />
                <Skeleton h="440px" borderRadius="lg" />
              </SimpleGrid>
            </Stack>
          </PageContainer>
        </Box>
        <SectionRule />
        <Box as="section" py={SECTION_PY}>
          <PageContainer>
            <SimpleGrid columns={{ base: 1, lg: 3 }} gap={{ base: 8, lg: 10 }}>
              <Skeleton h="320px" borderRadius="xl" />
              <Skeleton h="320px" borderRadius="xl" />
              <Skeleton h="320px" borderRadius="xl" />
            </SimpleGrid>
          </PageContainer>
        </Box>
        <SectionRule />
        <Box as="section" py={SECTION_PY}>
          <PageContainer>
            <Grid {...PRICING_SPLIT}>
              <Skeleton h="41px" w="min(14rem, 60%)" />
              <Stack gap={0}>
                <Skeleton h="88px" />
                <Skeleton h="88px" />
                <Skeleton h="88px" />
              </Stack>
            </Grid>
          </PageContainer>
        </Box>
      </MarketingFrame>
      <Footer />
    </>
  )
}
