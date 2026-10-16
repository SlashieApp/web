import {
  Box,
  Container,
  Grid,
  HStack,
  Heading,
  List,
  Stack,
  Text,
  VisuallyHidden,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { LuGithub, LuLinkedin } from 'react-icons/lu'

import { SLASHIE_GITHUB_URL, SLASHIE_LINKEDIN_URL } from '@/content/social'
import type { AppLocale } from '@/i18n/locales'
import { withLocale } from '@/i18n/navigation'
import { Button, Card, Link } from '@ui'

import { Reveal } from '../../components/ui/landing/Reveal'
import { FinalCtaBand } from '../../components/ui/landing/sections/FinalCtaBand'
import type messages from '../i11n.json'
import { ABOUT_VIEWS, type AboutView } from '../views'

type AboutCopy = (typeof messages)['en']
type CtaLabels = Record<'postTask' | 'becomeWorker' | 'browseTasks', string>

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <Heading
      as="h2"
      fontFamily="display"
      fontSize={{ base: '28px', md: '36px' }}
      letterSpacing="-0.02em"
    >
      {children}
    </Heading>
  )
}

function Steps({ title, steps }: { title: string; steps: readonly string[] }) {
  return (
    <Card layout="section" heading={title}>
      <List.Root as="ol" gap={3} ps={0} listStyle="none">
        {steps.map((step, index) => (
          <List.Item key={step} display="flex" gap={3} alignItems="flex-start">
            <Box
              as="span"
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              boxSize="24px"
              borderRadius="full"
              bg="status.success.soft"
              color="status.success.fg"
              fontSize="xs"
              fontWeight={700}
              flexShrink={0}
              aria-hidden
            >
              {index + 1}
            </Box>
            <Text color="text.default" lineHeight="tall">
              {step}
            </Text>
          </List.Item>
        ))}
      </List.Root>
    </Card>
  )
}

function ExternalButton({
  href,
  icon,
  label,
  newTab,
}: {
  href: string
  icon: ReactNode
  label: string
  newTab: string
}) {
  return (
    <Button asChild size="md" variant="secondary">
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        _hover={{ textDecoration: 'none' }}
      >
        <HStack gap={2}>
          {icon}
          <span>{label}</span>
          <VisuallyHidden>{newTab}</VisuallyHidden>
        </HStack>
      </Link>
    </Button>
  )
}

/**
 * /about: the same sections for everyone (see views/README.md); the view only
 * picks the closing buttons. Server-rendered, no data.
 */
export function AboutScreen({
  copy,
  ctas,
  view,
  locale,
}: {
  copy: AboutCopy
  ctas: CtaLabels
  view: AboutView
  locale: AppLocale
}) {
  const { primary, secondary } = ABOUT_VIEWS[view]

  return (
    <>
      <Box
        as="section"
        bgGradient="to-b"
        gradientFrom="status.success.soft"
        gradientTo="bg.canvas"
        pt={{ base: 12, md: 20 }}
        pb={{ base: 10, md: 14 }}
      >
        <Container>
          <Stack gap={4} maxW="3xl">
            <Heading
              as="h1"
              fontFamily="display"
              fontSize={{ base: '40px', md: '56px' }}
              letterSpacing="-0.03em"
              lineHeight="1.05"
            >
              {copy.hero.heading}
            </Heading>
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color="text.default"
              lineHeight="tall"
              maxW="36rem"
            >
              {copy.hero.body}
            </Text>
          </Stack>
        </Container>
      </Box>

      <Box as="section" py={{ base: 10, md: 14 }}>
        <Container>
          <Stack gap={6}>
            <SectionHeading>{copy.how.heading}</SectionHeading>
            <Reveal>
              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                <Steps
                  title={copy.how.customers.title}
                  steps={copy.how.customers.steps}
                />
                <Steps
                  title={copy.how.workers.title}
                  steps={copy.how.workers.steps}
                />
              </Grid>
            </Reveal>
          </Stack>
        </Container>
      </Box>

      <Box as="section" bg="bg.surface" py={{ base: 10, md: 14 }}>
        <Container>
          <Stack gap={6}>
            <SectionHeading>{copy.costs.heading}</SectionHeading>
            <Reveal>
              <List.Root
                display="grid"
                gridTemplateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
                gap={{ base: 5, md: 8 }}
                ps={0}
                listStyle="none"
              >
                {copy.costs.points.map((point) => (
                  <List.Item key={point.title} display="block">
                    <Stack gap={1.5}>
                      <Heading as="h3" size="lg">
                        {point.title}
                      </Heading>
                      <Text color="text.muted" lineHeight="tall">
                        {point.body}
                      </Text>
                    </Stack>
                  </List.Item>
                ))}
              </List.Root>
            </Reveal>
            <Link href="/pricing" tone="emphasis" w="fit-content">
              {copy.costs.pricingLink}
            </Link>
          </Stack>
        </Container>
      </Box>

      <Box as="section" py={{ base: 10, md: 14 }}>
        <Container>
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={10}>
            <Reveal>
              <Stack gap={3}>
                <SectionHeading>{copy.mission.heading}</SectionHeading>
                <Text color="text.muted" lineHeight="tall" fontSize="lg">
                  {copy.mission.body}
                </Text>
              </Stack>
            </Reveal>
            <Reveal delayMs={80}>
              <Stack gap={4}>
                <SectionHeading>{copy.open.heading}</SectionHeading>
                <Text color="text.muted" lineHeight="tall" fontSize="lg">
                  {copy.open.body}
                </Text>
                <HStack gap={3} flexWrap="wrap">
                  <ExternalButton
                    href={SLASHIE_GITHUB_URL}
                    icon={<LuGithub size={16} aria-hidden />}
                    label={copy.open.github}
                    newTab={copy.open.newTab}
                  />
                  <ExternalButton
                    href={SLASHIE_LINKEDIN_URL}
                    icon={<LuLinkedin size={16} aria-hidden />}
                    label={copy.open.linkedin}
                    newTab={copy.open.newTab}
                  />
                </HStack>
              </Stack>
            </Reveal>
          </Grid>
        </Container>
      </Box>

      <FinalCtaBand
        copy={copy.closing}
        primary={{
          label: ctas[primary.label],
          href: withLocale(locale, primary.href),
        }}
        secondary={{
          label: ctas[secondary.label],
          href: withLocale(locale, secondary.href),
        }}
      />
    </>
  )
}
