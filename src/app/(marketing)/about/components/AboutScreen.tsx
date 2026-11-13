import {
  Box,
  Flex,
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
import {
  LuGithub,
  LuHandCoins,
  LuHardHat,
  LuLinkedin,
  LuUser,
} from 'react-icons/lu'

import { SLASHIE_GITHUB_URL, SLASHIE_LINKEDIN_URL } from '@/content/social'
import type { AppLocale } from '@/i18n/locales'
import { withLocale } from '@/i18n/navigation'
import { PAGE_GUTTER_X } from '@/theme/pageContainer'
import { sdlEyebrow } from '@/theme/styles'
import { PageBleed } from '@/ui/PageContainer'
import { Button, Link } from '@ui'

import { CentredHero } from '../../components/layout/CentredHero'
import {
  MarketingFrame,
  SECTION_PY,
  SectionHead,
  SectionRule,
} from '../../components/layout/MarketingFrame'
import { Reveal } from '../../components/ui/landing/Reveal'
import { QuotesSnippet } from '../../components/ui/landing/bento/BentoSnippets'
import type { PhoneCopy } from '../../components/ui/landing/phone/phoneCopy'
import { FinalCtaBand } from '../../components/ui/landing/sections/FinalCtaBand'
import type messages from '../i11n.json'
import { ABOUT_VIEWS, type AboutView } from '../views'
import { AboutMapScene } from './ui/AboutMapScene'
import { SendQuoteSnippet } from './ui/SendQuoteSnippet'

type AboutCopy = (typeof messages)['en']
type CtaLabels = Record<'postTask' | 'becomeWorker' | 'browseTasks', string>

/** The headings' ids: they name the page's landmarks. */
export const ABOUT_HEADING_IDS = {
  hero: 'about-hero-heading',
  how: 'about-how-heading',
  customers: 'about-how-customers-heading',
  workers: 'about-how-workers-heading',
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
  titleId,
  steps,
}: {
  icon: IconType
  title: string
  /** The h3's id: it names the cell's snippet. */
  titleId: string
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
        <Heading as="h3" id={titleId} {...sdlEyebrow}>
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

/** The cells' top padding under a section head: a step closer than a section's. */
const CELL_PT_AFTER_HEAD = { base: 8, md: 10, lg: 12 } as const

/**
 * A row of cells like Home's bento (FE-554): side by side from `md`, divided
 * by 1px `border.default` lines, stacked below it with a hairline between
 * them. The row has no gutters; each cell brings the page's own
 * (`data-page-cell`), so its content sits on the logo and menu lines at the
 * row's ends. Under a section head the first cells start a step closer;
 * otherwise each cell has the section's rhythm (`SECTION_PY`). With
 * `subgrid`, a cell's two parts (its text, its snippet) share rows across the
 * cells from `md`, so the snippets start on one line.
 */
function CellRow({
  cells,
  afterHead = false,
  subgrid = false,
  list = false,
  tight = false,
}: {
  cells: readonly {
    key: string
    content: ReactNode
    props?: Record<string, string>
    as?: 'section' | 'div'
  }[]
  afterHead?: boolean
  subgrid?: boolean
  /** The row is a list (`ul`) and each cell an item. */
  list?: boolean
  /**
   * Short cells (a line or two): stacked on a phone they sit 32px from the
   * hairline between them instead of a section's 56.
   */
  tight?: boolean
}) {
  const inner = tight ? 8 : SECTION_PY.base
  return (
    <Grid
      as={list ? 'ul' : 'div'}
      m={0}
      p={0}
      listStyleType="none"
      templateColumns={{
        base: 'minmax(0, 1fr)',
        md: `repeat(${cells.length}, minmax(0, 1fr))`,
      }}
      templateRows={subgrid ? { md: 'auto 1fr' } : undefined}
    >
      {cells.map((cell, index) => (
        <Box
          key={cell.key}
          as={list ? 'li' : (cell.as ?? 'div')}
          data-page-cell=""
          data-about-cell=""
          {...cell.props}
          minW={0}
          px={PAGE_GUTTER_X}
          pt={
            afterHead
              ? {
                  ...CELL_PT_AFTER_HEAD,
                  base: index === 0 ? CELL_PT_AFTER_HEAD.base : inner,
                }
              : { ...SECTION_PY, base: index === 0 ? SECTION_PY.base : inner }
          }
          pb={{
            ...SECTION_PY,
            base: index === cells.length - 1 ? SECTION_PY.base : inner,
          }}
          borderColor="border.default"
          borderTopWidth={{ base: index === 0 ? 0 : '1px', md: 0 }}
          borderInlineStartWidth={{ base: 0, md: index === 0 ? 0 : '1px' }}
          {...(subgrid
            ? {
                display: 'grid',
                rowGap: { base: 8, md: 10 },
                gridRow: { md: 'span 2' },
                gridTemplateRows: { md: 'subgrid' },
                alignContent: 'start',
              }
            : {})}
        >
          {cell.content}
        </Box>
      ))}
    </Grid>
  )
}

/** A section head over a row of cells: on the page lines, the section's rhythm above it. */
function CellHead({ children }: { children: ReactNode }) {
  return (
    <Box data-page-cell="" px={PAGE_GUTTER_X} pt={SECTION_PY}>
      {children}
    </Box>
  )
}

/** One cost point: a green 600 icon (a state icon, never a fill), an h3 and a muted line. */
function CostPoint({
  icon: Icon,
  title,
  body,
}: {
  icon: IconType
  title: string
  body: string
}) {
  return (
    <Stack gap={3}>
      <Box
        as="span"
        display="inline-flex"
        color="accent.active"
        aria-hidden
        data-about-cost-icon=""
      >
        <Icon size={20} />
      </Box>
      <Stack gap={1.5}>
        <Heading as="h3" textStyle="heading-sm">
          {title}
        </Heading>
        <Text textStyle="text-sm" color="text.muted">
          {body}
        </Text>
      </Stack>
    </Stack>
  )
}

const COST_ICONS: readonly IconType[] = [LuUser, LuHardHat, LuHandCoins]

/**
 * /about, redesigned to follow Home (FE-554). In the marketing frame (white,
 * rails from `lg`, full-width rules between the sections), the same for
 * everyone (see views/README.md):
 *
 * 1. Home's centred hero: the title (the one h1) and the line, then the map
 *    scene ("a map-first marketplace for local tasks", shown).
 * 2. How it works: the two ways in as two cells like Home's bento, each its
 *    steps (hairline rows) over a live snippet: the customer compares quotes
 *    (Home's snippet), the worker sends one.
 * 3. What it costs: three cells, each an icon, a title and a line; See
 *    pricing beside the head.
 * 4. Why we're building it, and Built in the open: two cells.
 * 5. Home's closing band. The view only picks its buttons.
 *
 * The page (`page.tsx`) adds the footer under the frame. Every string is
 * today's About copy or Home's demo copy (`landing.phone`). The page's green
 * fill is the closing band's Post a task; the other green is state (icons,
 * the selected pin, the quote sent).
 */
export function AboutScreen({
  copy,
  ctas,
  phone,
  view,
  locale,
}: {
  copy: AboutCopy
  ctas: CtaLabels
  /** Home's demo copy (`landing.phone`), for the scenes. */
  phone: PhoneCopy
  view: AboutView
  locale: AppLocale
}) {
  const { primary, secondary } = ABOUT_VIEWS[view]

  return (
    <MarketingFrame bg="bg.surface">
      <CentredHero
        headingId={ABOUT_HEADING_IDS.hero}
        heading={copy.hero.heading}
        body={copy.hero.body}
        data-about-hero=""
      >
        <AboutMapScene phone={phone} />
      </CentredHero>

      <SectionRule />
      <PageBleed
        as="section"
        aria-labelledby={ABOUT_HEADING_IDS.how}
        data-about-how=""
        gutters="none"
      >
        <CellHead>
          <Reveal>
            <SectionHead
              heading={copy.how.heading}
              headingId={ABOUT_HEADING_IDS.how}
            />
          </Reveal>
        </CellHead>
        <CellRow
          afterHead
          subgrid
          cells={[
            {
              key: 'customers',
              content: (
                <>
                  <Reveal>
                    <StepGroup
                      icon={LuUser}
                      title={copy.how.customers.title}
                      titleId={ABOUT_HEADING_IDS.customers}
                      steps={copy.how.customers.steps}
                    />
                  </Reveal>
                  <QuotesSnippet
                    phone={phone}
                    labelledBy={ABOUT_HEADING_IDS.customers}
                  />
                </>
              ),
            },
            {
              key: 'workers',
              content: (
                <>
                  <Reveal delayMs={80}>
                    <StepGroup
                      icon={LuHardHat}
                      title={copy.how.workers.title}
                      titleId={ABOUT_HEADING_IDS.workers}
                      steps={copy.how.workers.steps}
                    />
                  </Reveal>
                  <SendQuoteSnippet
                    phone={phone}
                    labelledBy={ABOUT_HEADING_IDS.workers}
                  />
                </>
              ),
            },
          ]}
        />
      </PageBleed>

      <SectionRule />
      <PageBleed
        as="section"
        aria-labelledby={ABOUT_HEADING_IDS.costs}
        data-about-costs=""
        gutters="none"
      >
        <CellHead>
          <Reveal>
            <Flex
              direction={{ base: 'column', md: 'row' }}
              justify="space-between"
              align={{ base: 'flex-start', md: 'flex-end' }}
              gap={4}
            >
              <SectionHead
                heading={copy.costs.heading}
                headingId={ABOUT_HEADING_IDS.costs}
              />
              <Link href="/pricing" tone="emphasis" w="fit-content">
                {copy.costs.pricingLink}
              </Link>
            </Flex>
          </Reveal>
        </CellHead>
        <CellRow
          afterHead
          list
          tight
          cells={copy.costs.points.map((point, index) => ({
            key: point.title,
            props: { 'data-about-cost': '' },
            content: (
              <Reveal delayMs={index * 70}>
                <CostPoint
                  icon={COST_ICONS[index] ?? LuUser}
                  title={point.title}
                  body={point.body}
                />
              </Reveal>
            ),
          }))}
        />
      </PageBleed>

      <SectionRule />
      <PageBleed data-about-story="" gutters="none">
        <CellRow
          cells={[
            {
              key: 'mission',
              as: 'section',
              props: {
                'aria-labelledby': ABOUT_HEADING_IDS.mission,
                'data-about-mission': '',
              },
              content: (
                <Reveal>
                  <SectionHead
                    heading={copy.mission.heading}
                    headingId={ABOUT_HEADING_IDS.mission}
                    body={copy.mission.body}
                  />
                </Reveal>
              ),
            },
            {
              key: 'open',
              as: 'section',
              props: {
                'aria-labelledby': ABOUT_HEADING_IDS.open,
                'data-about-open': '',
              },
              content: (
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
              ),
            },
          ]}
        />
      </PageBleed>

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
