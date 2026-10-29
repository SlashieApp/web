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
import type { IconType } from 'react-icons'
import { LuGithub, LuHardHat, LuLinkedin, LuUser } from 'react-icons/lu'

import { SLASHIE_GITHUB_URL, SLASHIE_LINKEDIN_URL } from '@/content/social'
import type { AppLocale } from '@/i18n/locales'
import { withLocale } from '@/i18n/navigation'
import { sdlEyebrow } from '@/theme/styles'
import { Button, Link } from '@ui'

import {
  MarketingFrame,
  SECTION_PY,
  SectionHead,
  SectionRule,
} from '../../components/layout/MarketingFrame'
import { Reveal } from '../../components/ui/landing/Reveal'
import { FinalCtaBand } from '../../components/ui/landing/sections/FinalCtaBand'
import type messages from '../i11n.json'
import { ABOUT_VIEWS, type AboutView } from '../views'

type AboutCopy = (typeof messages)['en']
type CtaLabels = Record<'postTask' | 'becomeWorker' | 'browseTasks', string>

/** The headings' ids: they name the page's landmarks. */
export const ABOUT_HEADING_IDS = {
  hero: 'about-hero-heading',
  how: 'about-how-heading',
  costs: 'about-costs-heading',
  mission: 'about-mission-heading',
  open: 'about-open-heading',
} as const

/**
 * A hairline row: a 1px `border.default` line above it. The steps and the cost
 * points are rows of this kind, so the page has one vocabulary for its lists.
 */
const HAIRLINE_ABOVE = {
  borderTopWidth: '1px',
  borderColor: 'border.default',
} as const

/**
 * One section of the page: a landmark named by its heading, with the frame's
 * rhythm (`SECTION_PY`) and the page column. The rules between sections are
 * the page's (`SectionRule`), not the section's.
 */
function AboutSection({
  headingId,
  children,
  ...dataAttrs
}: {
  headingId: string
  children: ReactNode
} & Record<`data-${string}`, string>) {
  return (
    <Box
      as="section"
      aria-labelledby={headingId}
      py={SECTION_PY}
      {...dataAttrs}
    >
      <Container>{children}</Container>
    </Box>
  )
}

/**
 * One step as a hairline row, the way the landing sets its steps: the number
 * in Geist Mono 12 in `text.subtle` (neutral, never green), the step in
 * `text-md`. The list gives the numbering to assistive technology, so the
 * figure is decoration.
 */
function StepRow({ number, step }: { number: number; step: string }) {
  return (
    <List.Item
      data-about-step=""
      {...HAIRLINE_ABOVE}
      py={4}
      // The list's last row closes it with a hairline.
      css={{ '&:last-of-type': { borderBottomWidth: '1px' } }}
    >
      <Grid templateColumns="2.5rem minmax(0, 1fr)" alignItems="baseline">
        <Text
          as="span"
          data-about-step-number=""
          aria-hidden
          fontFamily="mono"
          fontSize="12px"
          lineHeight="16px"
          fontWeight={500}
          fontVariantNumeric="tabular-nums"
          color="text.subtle"
        >
          {String(number).padStart(2, '0')}
        </Text>
        <Text textStyle="text-md" color="text.default">
          {step}
        </Text>
      </Grid>
    </List.Item>
  )
}

/**
 * One of the two ways in: its name is the eyebrow (a small green 600 icon, 12px
 * caps in `text.subtle`; it is the group's h3), over its steps as hairline rows.
 */
function StepGroup({
  icon: Icon,
  title,
  steps,
}: {
  icon: IconType
  title: string
  steps: readonly string[]
}) {
  return (
    <Stack gap={5} data-about-steps="">
      <HStack gap={2}>
        <Box
          as="span"
          display="inline-flex"
          color="accent.active"
          flexShrink={0}
          aria-hidden
        >
          <Icon size={16} />
        </Box>
        <Heading as="h3" {...sdlEyebrow}>
          {title}
        </Heading>
      </HStack>
      <List.Root as="ol" m={0} ps={0} listStyle="none">
        {steps.map((step, index) => (
          <StepRow key={step} number={index + 1} step={step} />
        ))}
      </List.Root>
    </Stack>
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
 * /about in the marketing frame (FE-471, tone train 2): a white page, from `lg`
 * a 1px rail down each side of the page column and a full-width rule between
 * the sections, which are the same for everyone (see views/README.md): the
 * title (the h1), how it works, what it costs, why we're building it and the
 * open source note (side by side from `md`), and the closing band. The view
 * only picks the closing buttons. The page (`page.tsx`) adds the footer under
 * the frame. Server-rendered, no data.
 *
 * Section heads are the frame's `SectionHead`, left-aligned. They have no
 * eyebrow: it would need a string, and this page adds none. The eyebrow style
 * is on the two step groups' names instead, which are today's strings. The
 * step numbers are neutral (Geist Mono 12, `text.subtle`). The page's green is
 * the group icons and the closing band's Post a task pill.
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
    <MarketingFrame bg="bg.surface">
      <AboutSection headingId={ABOUT_HEADING_IDS.hero} data-about-hero="">
        <Stack gap={{ base: 4, md: 5 }} align="flex-start" maxW="48rem">
          <Heading
            as="h1"
            id={ABOUT_HEADING_IDS.hero}
            textStyle={{ base: 'display-lg', md: 'display-xl' }}
            textWrap="balance"
          >
            {copy.hero.heading}
          </Heading>
          <Text
            textStyle="text-lg"
            color="text.muted"
            textWrap="balance"
            maxW="56ch"
          >
            {copy.hero.body}
          </Text>
        </Stack>
      </AboutSection>

      <SectionRule />
      <AboutSection headingId={ABOUT_HEADING_IDS.how} data-about-how="">
        <Stack gap={{ base: 8, md: 12 }}>
          <Reveal>
            <SectionHead
              heading={copy.how.heading}
              headingId={ABOUT_HEADING_IDS.how}
            />
          </Reveal>
          <Reveal delayMs={80}>
            <Grid
              templateColumns={{
                base: 'minmax(0, 1fr)',
                md: 'repeat(2, minmax(0, 1fr))',
              }}
              columnGap={{ md: 8, lg: 16 }}
              rowGap={{ base: 10, md: 0 }}
              alignItems="start"
            >
              <StepGroup
                icon={LuUser}
                title={copy.how.customers.title}
                steps={copy.how.customers.steps}
              />
              <StepGroup
                icon={LuHardHat}
                title={copy.how.workers.title}
                steps={copy.how.workers.steps}
              />
            </Grid>
          </Reveal>
        </Stack>
      </AboutSection>

      <SectionRule />
      <AboutSection headingId={ABOUT_HEADING_IDS.costs} data-about-costs="">
        <Stack gap={{ base: 8, md: 12 }}>
          <Reveal>
            <SectionHead
              heading={copy.costs.heading}
              headingId={ABOUT_HEADING_IDS.costs}
            />
          </Reveal>
          <Reveal delayMs={80}>
            <Stack gap={{ base: 5, md: 6 }}>
              <List.Root
                m={0}
                ps={0}
                listStyle="none"
                display="grid"
                gridTemplateColumns={{
                  base: 'minmax(0, 1fr)',
                  md: 'repeat(3, minmax(0, 1fr))',
                }}
                columnGap={{ md: 8, lg: 12 }}
              >
                {copy.costs.points.map((point, index) => (
                  <List.Item
                    key={point.title}
                    data-about-cost=""
                    {...HAIRLINE_ABOVE}
                    py={5}
                    // One column: the last point closes the list with a hairline.
                    borderBottomWidth={{
                      base: index === copy.costs.points.length - 1 ? '1px' : 0,
                      md: 0,
                    }}
                  >
                    <Stack gap={1.5}>
                      <Heading as="h3" textStyle="heading-sm">
                        {point.title}
                      </Heading>
                      <Text textStyle="text-sm" color="text.muted">
                        {point.body}
                      </Text>
                    </Stack>
                  </List.Item>
                ))}
              </List.Root>
              <Link href="/pricing" tone="emphasis" w="fit-content">
                {copy.costs.pricingLink}
              </Link>
            </Stack>
          </Reveal>
        </Stack>
      </AboutSection>

      <SectionRule />
      <Box py={SECTION_PY} data-about-story="">
        <Container>
          <Grid
            templateColumns={{
              base: 'minmax(0, 1fr)',
              md: 'repeat(2, minmax(0, 1fr))',
            }}
            columnGap={{ md: 8, lg: 16 }}
            rowGap={{ base: 14, md: 0 }}
            alignItems="start"
          >
            <Box
              as="section"
              aria-labelledby={ABOUT_HEADING_IDS.mission}
              data-about-mission=""
            >
              <Reveal>
                <SectionHead
                  heading={copy.mission.heading}
                  headingId={ABOUT_HEADING_IDS.mission}
                  body={copy.mission.body}
                />
              </Reveal>
            </Box>
            <Box
              as="section"
              aria-labelledby={ABOUT_HEADING_IDS.open}
              data-about-open=""
            >
              <Reveal delayMs={80}>
                <Stack gap={6}>
                  <SectionHead
                    heading={copy.open.heading}
                    headingId={ABOUT_HEADING_IDS.open}
                    body={copy.open.body}
                  />
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
            </Box>
          </Grid>
        </Container>
      </Box>

      <SectionRule />
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
    </MarketingFrame>
  )
}
