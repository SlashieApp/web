import type { Metadata } from 'next'

import {
  Box,
  Container,
  Grid,
  HStack,
  Heading,
  List,
  Stack,
  Text,
} from '@chakra-ui/react'
import NextLink from 'next/link'

import { HomeAuthRedirect } from '@/app/(marketing)/helpers/HomeAuthRedirect'
import {
  formatPricingInterval,
  pricingDisplayPrice,
} from '@/app/(marketing)/pricing/helpers/formatPricing'
import { getPricingForPage } from '@/app/(marketing)/pricing/helpers/getPricingForPage'
import { buildWorkerFreePlan } from '@/app/(marketing)/pricing/helpers/pricingPlans'
import { Button, Logo } from '@/ui'
import { APP_HOME } from '@/utils/appRoutes'

export const metadata: Metadata = {
  title: 'Slashie — Local tasks and trusted quotes',
  description:
    'Slashie is a map-first local marketplace. Post tasks, compare quotes from local workers, and pay directly — Slashie connects you without taking a cut of the job.',
}

const HERO_TASK_CARDS = [
  {
    title: 'Flat pack assembly',
    area: 'Clapham, SW4',
    price: '£80',
    quotes: 2,
    rating: '4.9',
    offset: { top: '12%', left: '8%' },
  },
  {
    title: 'Garden tidy',
    area: 'Brixton, SW2',
    price: '£120',
    quotes: 3,
    rating: '4.8',
    offset: { top: '38%', right: '6%' },
  },
  {
    title: 'Paint bedroom',
    area: 'Peckham, SE15',
    price: '£150',
    quotes: 4,
    rating: '4.7',
    offset: { bottom: '10%', left: '18%' },
  },
] as const

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Post a task',
    body: 'Describe the job, set a budget, pick a location.',
    icon: 'post',
  },
  {
    step: '2',
    title: 'Compare quotes',
    body: 'Workers send priced quotes with profiles and reviews.',
    icon: 'quotes',
  },
  {
    step: '3',
    title: 'Accept & pay directly',
    body: 'Choose your worker; payment is between you two.',
    icon: 'pay',
  },
] as const

const DEMAND_FEATURES = [
  { label: 'Find jobs close to you', icon: 'pin' },
  { label: 'Filter by category, budget & timing', icon: 'filter' },
  { label: 'Be first to quote on new tasks', icon: 'send' },
  { label: 'Win more work in your area', icon: 'chart' },
] as const

const TRUST_POINTS = [
  'Job payments are direct between customer and worker',
  'Slashie does not hold or release job money',
  'Worker profiles, verification, and reviews',
  'Local marketplace — real people, real jobs',
] as const

const MAP_PINS = [
  { label: '£50', top: '18%', left: '22%' },
  { label: '£80', top: '32%', left: '48%' },
  { label: '£110', top: '24%', right: '18%' },
  { label: '£150', top: '52%', left: '30%' },
  { label: '£200', bottom: '22%', right: '24%' },
  { label: '£60', bottom: '30%', left: '12%' },
  { label: '£90', top: '58%', right: '36%' },
] as const

function CheckIcon() {
  return (
    <Box
      as="span"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      boxSize="18px"
      borderRadius="full"
      bg="primary.500"
      color="white"
      flexShrink={0}
      mt="2px"
      aria-hidden
    >
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
        <title>Included</title>
        <path
          d="M2.5 6l2.5 2.5 4.5-5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  )
}

function StepIcon({ kind }: { kind: string }) {
  const paths: Record<string, React.ReactNode> = {
    post: (
      <path
        d="M8 4H6V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v10l3-2 3 2V4Zm2 0v8l2 1V5a1 1 0 0 0-1-1h-1Z"
        fill="currentColor"
      />
    ),
    quotes: <path d="M7 3h6v10H7l-2 2V3Zm-4 2h2v8H3V5Z" fill="currentColor" />,
    pay: (
      <path
        d="M8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm5-1h1v2h-1v-2ZM4 11H2v-1h2v1Z"
        fill="currentColor"
      />
    ),
  }
  return (
    <Box
      boxSize="44px"
      borderRadius="xl"
      bg="primary.100"
      color="primary.700"
      display="flex"
      alignItems="center"
      justifyContent="center"
      aria-hidden
    >
      <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
        <title>{kind}</title>
        {paths[kind]}
      </svg>
    </Box>
  )
}

function FeatureIcon({ kind }: { kind: string }) {
  return (
    <Box
      boxSize="36px"
      borderRadius="lg"
      bg="primary.100"
      color="primary.700"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
      aria-hidden
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <title>{kind}</title>
        <circle
          cx="12"
          cy="10"
          r="3"
          stroke="currentColor"
          strokeWidth="1.8"
          opacity={kind === 'pin' ? 1 : 0}
        />
        <path
          d={
            kind === 'pin'
              ? 'M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z'
              : kind === 'filter'
                ? 'M4 6h16M7 12h10M10 18h4'
                : kind === 'send'
                  ? 'M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z'
                  : 'M4 18V6M8 18v-8M12 18v-4M16 18V8M20 18v-2'
          }
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  )
}

function HeroTaskCard({
  title,
  area,
  price,
  quotes,
  rating,
  offset,
}: (typeof HERO_TASK_CARDS)[number]) {
  return (
    <Box
      position="absolute"
      {...offset}
      bg="cardBg"
      borderWidth="1px"
      borderColor="cardBorder"
      borderRadius="xl"
      boxShadow="md"
      p={3}
      minW={{ base: '160px', md: '190px' }}
      zIndex={2}
    >
      <Stack gap={1.5}>
        <Text fontSize="sm" fontWeight={700} color="cardFg" lineClamp={1}>
          {title}
        </Text>
        <Text fontSize="xs" color="formLabelMuted">
          {area}
        </Text>
        <HStack justify="space-between" align="center">
          <Text fontSize="sm" fontWeight={800} color="primary.700">
            {price}
          </Text>
          <Text fontSize="2xs" color="formLabelMuted">
            ★ {rating}
          </Text>
        </HStack>
        <Text fontSize="2xs" fontWeight={600} color="primary.700">
          {quotes} quotes
        </Text>
      </Stack>
    </Box>
  )
}

function AudienceCard({
  title,
  icon,
  items,
  ctaLabel,
  href,
  featured = false,
}: {
  title: string
  icon: 'customers' | 'workers'
  items: string[]
  ctaLabel: string
  href: string
  featured?: boolean
}) {
  return (
    <Stack
      gap={5}
      borderWidth={featured ? '2px' : '1px'}
      borderColor={featured ? 'primary.300' : 'cardBorder'}
      borderRadius="2xl"
      bg="cardBg"
      p={{ base: 5, md: 7 }}
      boxShadow="sm"
      h="full"
    >
      <HStack gap={3} align="center">
        <Box
          boxSize="44px"
          borderRadius="full"
          bg="primary.100"
          color="primary.700"
          display="flex"
          alignItems="center"
          justifyContent="center"
          aria-hidden
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <title>{title}</title>
            {icon === 'customers' ? (
              <>
                <circle
                  cx="9"
                  cy="8"
                  r="3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle
                  cx="16"
                  cy="9"
                  r="2.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M3 20c0-3 3.5-5 6-5s6 2 6 5M13 20c0-2 2.5-3.5 5-3.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </>
            ) : (
              <>
                <circle
                  cx="12"
                  cy="8"
                  r="3.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M6 20c0-3.5 3.2-5.5 6-5.5s6 2 6 5.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M9 5h6l1 3H8l1-3Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </>
            )}
          </svg>
        </Box>
        <Heading size="md">{title}</Heading>
      </HStack>
      <List.Root gap={3} ps={0} style={{ listStyle: 'none' }}>
        {items.map((item) => (
          <List.Item key={item} display="flex" gap={3} alignItems="flex-start">
            <CheckIcon />
            <Text fontSize="sm" color="cardFg" lineHeight="tall">
              {item}
            </Text>
          </List.Item>
        ))}
      </List.Root>
      <NextLink href={href} style={{ textDecoration: 'none' }}>
        <Button w="fit-content" variant={featured ? 'primary' : 'secondary'}>
          {ctaLabel}
        </Button>
      </NextLink>
    </Stack>
  )
}

function LandingFooter() {
  return (
    <Box
      as="footer"
      borderTopWidth="1px"
      borderColor="cardBorder"
      bg="bg"
      py={10}
    >
      <Container maxW="6xl" px={{ base: 4, md: 6 }}>
        <Stack gap={8}>
          <HStack
            justify="space-between"
            align="flex-start"
            flexWrap="wrap"
            gap={6}
          >
            <Stack gap={2}>
              <Logo />
              <Text fontSize="sm" color="formLabelMuted">
                Map-first local task marketplace.
              </Text>
            </Stack>
            <HStack gap={5} flexWrap="wrap">
              {[
                { label: 'Pricing', href: '/pricing' },
                { label: 'About', href: '/about' },
                { label: 'Log in', href: '/login' },
                { label: 'Register', href: '/register' },
              ].map((link) => (
                <NextLink
                  key={link.href}
                  href={link.href}
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--chakra-colors-cardFg)',
                    textDecoration: 'none',
                  }}
                >
                  {link.label}
                </NextLink>
              ))}
            </HStack>
          </HStack>
          <HStack
            justify="space-between"
            flexWrap="wrap"
            gap={4}
            fontSize="sm"
            color="formLabelMuted"
          >
            <Text>© Slashie 2026</Text>
            <HStack gap={4}>
              <NextLink
                href="/terms"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                Terms
              </NextLink>
              <NextLink
                href="/privacy"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                Privacy
              </NextLink>
            </HStack>
          </HStack>
        </Stack>
      </Container>
    </Box>
  )
}

export default async function MarketingHomePage() {
  const { pricing } = await getPricingForPage()
  const workerFree = buildWorkerFreePlan(pricing?.freeQuotesPerMonth ?? 3)
  const unlimitedPrice = pricing
    ? `${pricingDisplayPrice(pricing)}/${formatPricingInterval(pricing.priceInterval)}`
    : '£19.99/month'
  const trialLabel = pricing?.trialLabel?.trim() || '6 months free trial'

  return (
    <>
      <HomeAuthRedirect />

      {/* Hero */}
      <Box
        as="section"
        bg="linear-gradient(180deg, primary.50 0%, neutral.100 65%)"
        py={{ base: 10, md: 16 }}
        overflow="hidden"
      >
        <Container maxW="6xl" px={{ base: 4, md: 6 }}>
          <Grid
            templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
            gap={{ base: 10, lg: 8 }}
            alignItems="center"
          >
            <Stack gap={6}>
              <Heading
                size={{ base: '2xl', md: '3xl', lg: '4xl' }}
                lineHeight="1.08"
                color="secondary.900"
                fontFamily="var(--font-plus-jakarta)"
                letterSpacing="-0.02em"
              >
                Local tasks. Real quotes.{' '}
                <Text as="span" color="primary.600">
                  On the map.
                </Text>
              </Heading>
              <Text
                fontSize={{ base: 'md', md: 'lg' }}
                color="formLabelMuted"
                lineHeight="tall"
                maxW="lg"
              >
                Post a job, compare quotes from local workers, and arrange
                payment directly. Slashie connects you — we don&apos;t take a
                cut of the job.
              </Text>
              <HStack gap={3} flexWrap="wrap">
                <NextLink href="/register" style={{ textDecoration: 'none' }}>
                  <Button size="lg">Get started</Button>
                </NextLink>
                <NextLink href="/login" style={{ textDecoration: 'none' }}>
                  <Button size="lg" variant="secondary">
                    Log in
                  </Button>
                </NextLink>
              </HStack>
              <HStack gap={3} align="center" flexWrap="wrap">
                <HStack gap={0}>
                  {['A', 'B', 'C'].map((initial, i) => (
                    <Box
                      key={initial}
                      boxSize="32px"
                      borderRadius="full"
                      bg="primary.200"
                      color="primary.800"
                      fontSize="xs"
                      fontWeight={700}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      borderWidth="2px"
                      borderColor="cardBg"
                      ml={i === 0 ? 0 : -2}
                      zIndex={3 - i}
                    >
                      {initial}
                    </Box>
                  ))}
                </HStack>
                <Text fontSize="sm" color="formLabelMuted">
                  <Text as="span" color="mustard.400" fontWeight={700}>
                    ★★★★★
                  </Text>{' '}
                  4.8/5 from 2,300+ users
                </Text>
              </HStack>
            </Stack>

            <Box
              position="relative"
              minH={{ base: '320px', md: '400px' }}
              borderRadius="2xl"
              bg="linear-gradient(145deg, primary.100 0%, neutral.100 55%, primary.50 100%)"
              borderWidth="1px"
              borderColor="primary.200"
              overflow="hidden"
            >
              <Box
                position="absolute"
                inset={0}
                opacity={0.35}
                bgImage="radial-gradient(circle at 20% 30%, #92E7B7 0%, transparent 45%), radial-gradient(circle at 80% 70%, #D9F4E5 0%, transparent 40%)"
              />
              {HERO_TASK_CARDS.map((card) => (
                <HeroTaskCard key={card.title} {...card} />
              ))}
              {[28, 62, 45].map((left, i) => (
                <Box
                  key={left}
                  position="absolute"
                  top={`${30 + i * 18}%`}
                  left={`${left}%`}
                  boxSize="10px"
                  borderRadius="full"
                  bg="primary.500"
                  borderWidth="2px"
                  borderColor="white"
                  boxShadow="sm"
                  zIndex={1}
                  aria-hidden
                />
              ))}
            </Box>
          </Grid>
        </Container>
      </Box>

      {/* How it works */}
      <Box as="section" py={{ base: 12, md: 16 }} bg="bg">
        <Container maxW="6xl" px={{ base: 4, md: 6 }}>
          <Stack gap={10}>
            <Heading size="lg" textAlign="center">
              How Slashie works
            </Heading>
            <Grid
              templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
              gap={6}
            >
              {HOW_IT_WORKS.map((item) => (
                <Stack
                  key={item.step}
                  gap={4}
                  align="center"
                  textAlign="center"
                  p={{ base: 4, md: 5 }}
                >
                  <StepIcon kind={item.icon} />
                  <Text
                    fontSize="xs"
                    fontWeight={800}
                    color="primary.700"
                    letterSpacing="0.08em"
                  >
                    {item.step}
                  </Text>
                  <Heading size="sm">{item.title}</Heading>
                  <Text fontSize="sm" color="formLabelMuted" lineHeight="tall">
                    {item.body}
                  </Text>
                </Stack>
              ))}
            </Grid>
          </Stack>
        </Container>
      </Box>

      {/* Customers & workers */}
      <Box as="section" py={{ base: 12, md: 16 }} bg="neutral.100">
        <Container maxW="6xl" px={{ base: 4, md: 6 }}>
          <Stack gap={10}>
            <Heading size="lg" textAlign="center">
              Built for customers and workers
            </Heading>
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
              <AudienceCard
                title="For customers"
                icon="customers"
                items={[
                  'Post tasks for free',
                  'Compare multiple quotes',
                  'No platform fee on the job',
                ]}
                ctaLabel="Post a task"
                href="/tasks/create"
              />
              <AudienceCard
                title="For workers"
                icon="workers"
                featured
                items={[
                  'Browse local tasks on the map',
                  'Send quotes and win work',
                  'Free tier + Slashie Unlimited for unlimited quotes',
                ]}
                ctaLabel="Become a worker"
                href="/register"
              />
            </Grid>
          </Stack>
        </Container>
      </Box>

      {/* See demand near you */}
      <Box as="section" py={{ base: 12, md: 16 }} bg="bg">
        <Container maxW="6xl" px={{ base: 4, md: 6 }}>
          <Grid
            templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
            gap={{ base: 10, lg: 12 }}
            alignItems="center"
          >
            <Stack gap={6}>
              <Heading size="lg">See demand near you</Heading>
              <Text color="formLabelMuted" lineHeight="tall" fontSize="md">
                Browse open tasks on a map — not endless scrolling through
                classifieds.
              </Text>
              <Stack gap={4}>
                {DEMAND_FEATURES.map((feature) => (
                  <HStack key={feature.label} gap={4} align="flex-start">
                    <FeatureIcon kind={feature.icon} />
                    <Text
                      fontSize="sm"
                      fontWeight={600}
                      color="cardFg"
                      pt={1.5}
                    >
                      {feature.label}
                    </Text>
                  </HStack>
                ))}
              </Stack>
              <NextLink href={APP_HOME} style={{ textDecoration: 'none' }}>
                <Button w="fit-content" variant="secondary">
                  Browse tasks
                </Button>
              </NextLink>
            </Stack>

            <Box
              position="relative"
              minH={{ base: '280px', md: '360px' }}
              borderRadius="2xl"
              borderWidth="1px"
              borderColor="cardBorder"
              bg="linear-gradient(160deg, #E8F8EF 0%, #F7F9F8 50%, #D9F4E5 100%)"
              overflow="hidden"
            >
              <Text
                position="absolute"
                top={4}
                left={4}
                fontSize="xs"
                fontWeight={700}
                color="formLabelMuted"
              >
                London
              </Text>
              {MAP_PINS.map((pin) => (
                <Box
                  key={pin.label}
                  position="absolute"
                  {...('top' in pin ? { top: pin.top } : {})}
                  {...('left' in pin ? { left: pin.left } : {})}
                  {...('right' in pin ? { right: pin.right } : {})}
                  {...('bottom' in pin ? { bottom: pin.bottom } : {})}
                  transform="translate(-50%, -50%)"
                  bg="cardBg"
                  borderWidth="1px"
                  borderColor="primary.300"
                  borderRadius="full"
                  px={2.5}
                  py={1}
                  fontSize="xs"
                  fontWeight={800}
                  color="primary.700"
                  boxShadow="sm"
                  zIndex={1}
                >
                  {pin.label}
                </Box>
              ))}
            </Box>
          </Grid>
        </Container>
      </Box>

      {/* Trust bar */}
      <Box as="section" bg="primary.50" py={{ base: 8, md: 10 }}>
        <Container maxW="6xl" px={{ base: 4, md: 6 }}>
          <Grid
            templateColumns={{
              base: '1fr',
              sm: '1fr 1fr',
              lg: 'repeat(4, 1fr)',
            }}
            gap={5}
          >
            {TRUST_POINTS.map((point) => (
              <HStack key={point} gap={3} align="flex-start">
                <CheckIcon />
                <Text
                  fontSize="sm"
                  fontWeight={600}
                  color="cardFg"
                  lineHeight="tall"
                >
                  {point}
                </Text>
              </HStack>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing teaser */}
      <Box as="section" py={{ base: 12, md: 16 }} bg="bg">
        <Container maxW="4xl" px={{ base: 4, md: 6 }}>
          <Stack gap={8} align="center">
            <Heading size="lg" textAlign="center">
              Simple, honest pricing
            </Heading>
            <Grid
              templateColumns={{ base: '1fr', md: '1fr 1fr' }}
              gap={5}
              w="full"
            >
              <Stack
                gap={3}
                borderWidth="1px"
                borderColor="cardBorder"
                borderRadius="2xl"
                bg="cardBg"
                p={{ base: 5, md: 6 }}
                textAlign="center"
              >
                <Text fontSize="sm" fontWeight={700} color="formLabelMuted">
                  Workers — Free
                </Text>
                <Heading size="md">{workerFree.badge}</Heading>
                <Text fontSize="sm" color="formLabelMuted">
                  Browse tasks and send quotes on the free tier.
                </Text>
              </Stack>
              <Stack
                gap={3}
                borderWidth="2px"
                borderColor="primary.300"
                borderRadius="2xl"
                bg="cardBg"
                p={{ base: 5, md: 6 }}
                textAlign="center"
              >
                <Text fontSize="sm" fontWeight={700} color="primary.700">
                  {pricing?.productName ?? 'Slashie Unlimited'}
                </Text>
                <Heading size="md" color="primary.700">
                  {trialLabel}
                </Heading>
                <Text fontSize="sm" color="formLabelMuted">
                  Then {unlimitedPrice}
                </Text>
              </Stack>
            </Grid>
            <NextLink
              href="/pricing"
              style={{
                color: 'var(--chakra-colors-primary-700)',
                fontWeight: 700,
                fontSize: '0.95rem',
                textDecoration: 'none',
              }}
            >
              View pricing &gt;
            </NextLink>
          </Stack>
        </Container>
      </Box>

      {/* Final CTA */}
      <Box as="section" bg="secondary.900" py={{ base: 10, md: 12 }}>
        <Container maxW="6xl" px={{ base: 4, md: 6 }}>
          <HStack
            justify="space-between"
            align={{ base: 'flex-start', md: 'center' }}
            flexDirection={{ base: 'column', md: 'row' }}
            gap={6}
          >
            <Stack gap={2} maxW="lg">
              <Heading size="lg" color="white">
                Ready to get started?
              </Heading>
              <Text color="neutral.300" lineHeight="tall">
                Join thousands of people getting things done locally.
              </Text>
            </Stack>
            <HStack gap={3} flexWrap="wrap">
              <NextLink href="/register" style={{ textDecoration: 'none' }}>
                <Button size="lg">Get started</Button>
              </NextLink>
              <NextLink href="/login" style={{ textDecoration: 'none' }}>
                <Button size="lg" variant="secondary">
                  Log in
                </Button>
              </NextLink>
            </HStack>
          </HStack>
        </Container>
      </Box>

      <LandingFooter />
    </>
  )
}
