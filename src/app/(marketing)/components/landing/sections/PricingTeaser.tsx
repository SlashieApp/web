import {
  Box,
  Container,
  Grid,
  HStack,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { LuSparkles } from 'react-icons/lu'

import { Button } from '@ui'

import { Reveal } from '../Reveal'

export type LandingPricing = {
  /** e.g. "Slashie Unlimited" */
  productName: string
  /** e.g. "6 months free trial" */
  trialLabel: string
  /** e.g. "Then £19.99/month" */
  priceLine: string
  /** Free-tier badge, e.g. "3 free quotes every month" */
  freeBadge: string
}

/**
 * Pricing teaser. The worker subscription is the product's single premium
 * layer — and the ONLY place plum (`accent.premium`) appears on the landing.
 */
export function PricingTeaser({ pricing }: { pricing: LandingPricing }) {
  return (
    <Box as="section" bg="bg.canvas" py={{ base: 16, md: 24 }}>
      <Container maxW="4xl" px={{ base: 4, md: 6 }}>
        <Stack gap={{ base: 8, md: 10 }} align="center">
          <Reveal>
            <Stack gap={3} textAlign="center" align="center">
              <Heading
                as="h2"
                fontFamily="display"
                fontSize={{ base: '28px', md: '36px' }}
                letterSpacing="-0.01em"
              >
                Simple, honest pricing
              </Heading>
              <Text color="text.muted" maxW="65ch">
                Customers never pay a platform fee. Workers subscribe for access
                — and keep 100% of the job price.
              </Text>
            </Stack>
          </Reveal>

          <Grid
            templateColumns={{ base: '1fr', md: '1fr 1fr' }}
            gap={5}
            w="full"
          >
            <Reveal h="full">
              <Stack
                gap={3}
                h="full"
                p={{ base: 5, md: 6 }}
                bg="bg.surface"
                borderRadius="2xl"
                borderWidth="1px"
                borderColor="border.default"
                textAlign="center"
                align="center"
              >
                <Text fontSize="sm" fontWeight={700} color="text.muted">
                  Workers — Free
                </Text>
                <Heading as="h3" fontSize="24px" fontWeight={600}>
                  {pricing.freeBadge}
                </Heading>
                <Text fontSize="sm" color="text.muted">
                  Browse local tasks and send quotes on the free tier.
                </Text>
              </Stack>
            </Reveal>

            <Reveal delayMs={120} h="full">
              <Stack
                gap={3}
                h="full"
                p={{ base: 5, md: 6 }}
                bg="bg.surface"
                borderRadius="2xl"
                borderWidth="2px"
                borderColor="accent.premium"
                textAlign="center"
                align="center"
                position="relative"
              >
                <HStack gap={1.5} color="accent.premium" fontWeight={700}>
                  <LuSparkles size={16} aria-hidden />
                  <Text fontSize="sm">{pricing.productName}</Text>
                </HStack>
                <Heading as="h3" fontSize="24px" fontWeight={600}>
                  {pricing.trialLabel}
                </Heading>
                <Text fontSize="sm" color="text.muted">
                  {pricing.priceLine} · unlimited quotes
                </Text>
              </Stack>
            </Reveal>
          </Grid>

          <Reveal delayMs={160}>
            <NextLink href="/pricing" style={{ textDecoration: 'none' }}>
              <Button variant="premium">View pricing</Button>
            </NextLink>
          </Reveal>
        </Stack>
      </Container>
    </Box>
  )
}
