import { Box, Grid, Stack, Text } from '@chakra-ui/react'
import { Fragment, type ReactNode } from 'react'

import { CentredHero } from '@/app/(marketing)/components/layout/CentredHero'
import { linkifyEmails } from '@/app/(marketing)/components/layout/LegalPageLayout'
import {
  MarketingFrame,
  SECTION_PY,
  SectionHead,
  SectionRule,
} from '@/app/(marketing)/components/layout/MarketingFrame'
import { Reveal } from '@/app/(marketing)/components/ui/landing/Reveal'
import { AcceptedSnippet } from '@/app/(marketing)/components/ui/landing/bento/BentoSnippets'
import type { PhoneCopy } from '@/app/(marketing)/components/ui/landing/phone/phoneCopy'
import type { LegalDocument } from '@/content/legal/types'
import { PageContainer } from '@/ui/PageContainer'

import {
  AcceptDialogScene,
  type ReportCopy,
  ReportScene,
} from './ui/SafetyScenes'

/** The hero's heading id: the page's h1. */
export const SAFETY_HERO_HEADING_ID = 'safety-hero-heading'

/** A section's heading id, by its place in the document. */
export const safetySectionHeadingId = (index: number) =>
  `safety-section-${index}-heading`

/**
 * The scene beside each section, by its place in the document (the copy's
 * order: paying, meeting, reporting, what Slashie does not do). The last
 * section has none: it is the plain list of what Slashie does not do.
 */
function sceneFor(
  index: number,
  {
    phone,
    report,
    labelledBy,
  }: { phone: PhoneCopy; report: ReportCopy; labelledBy: string },
): ReactNode {
  switch (index) {
    case 0:
      return <AcceptedSnippet phone={phone} labelledBy={labelledBy} />
    case 1:
      return <AcceptDialogScene phone={phone} labelledBy={labelledBy} />
    case 2:
      return (
        <ReportScene
          report={report}
          taskTitle={phone.tasks.hedge.title}
          labelledBy={labelledBy}
        />
      )
    default:
      return null
  }
}

/**
 * /help/safety, "Paying & meeting safely", redesigned to follow Home
 * (FE-555). In the marketing frame (white, rails from `lg`, full-width rules
 * between the sections):
 *
 * 1. Home's centred hero: the title (the one h1) and the description, then
 *    the intro and "Last updated" under them.
 * 2. One section per heading of the guide: the heading (an h2) and its
 *    paragraphs on the left, from `lg`, and a scene on the right showing what
 *    the text is about, in the app's own words: paying (Home's accepted
 *    quote, pay the worker directly), meeting (the accept-quote dialog and
 *    its safety note), reporting (the ⋮ menu and the report dialog). The last
 *    section, what Slashie does not do, has no scene: its text takes the
 *    scene's column. Below `lg` everything stacks in reading order.
 *
 * The copy is the guide's (`i11n.json`), unchanged by the layout; email
 * addresses are mailto links, as on the legal pages. A section with an `id`
 * (How to report: `report`) keeps it, so the app's links to
 * /help/safety#report still land on it. The page (`page.tsx`) adds the
 * minimal footer under the frame.
 */
export function SafetyScreen({
  document: guide,
  phone,
  report,
}: {
  document: LegalDocument & { lastUpdatedLabel: string }
  /** Home's demo copy (`landing.phone`), for the scenes. */
  phone: PhoneCopy
  /** The report dialog's copy, for the reporting scene. */
  report: ReportCopy
}) {
  return (
    <MarketingFrame bg="bg.surface">
      <CentredHero
        headingId={SAFETY_HERO_HEADING_ID}
        heading={guide.title}
        body={guide.description}
        data-safety-hero=""
      >
        <Stack
          data-safety-intro=""
          gap={4}
          mx="auto"
          maxW="40rem"
          textAlign="center"
        >
          {(guide.intro ?? []).map((paragraph) => (
            <Text key={paragraph} textStyle="text-md" color="text.default">
              {paragraph}
            </Text>
          ))}
          <Text textStyle="text-sm" color="text.muted">
            {guide.lastUpdatedLabel}: {guide.lastUpdated}
          </Text>
        </Stack>
      </CentredHero>

      {guide.sections.map((section, index) => {
        const headingId = safetySectionHeadingId(index)
        const scene = sceneFor(index, {
          phone,
          report,
          labelledBy: headingId,
        })
        const head = (
          <SectionHead heading={section.heading} headingId={headingId} />
        )
        const body = (
          <Stack gap={4}>
            {section.body.map((paragraph) => (
              <Text key={paragraph} textStyle="text-md" color="text.muted">
                {linkifyEmails(paragraph)}
              </Text>
            ))}
          </Stack>
        )
        return (
          <Fragment key={section.heading}>
            <SectionRule />
            <Box
              as="section"
              id={section.id}
              aria-labelledby={headingId}
              data-safety-section={section.id ?? String(index)}
              py={SECTION_PY}
              // A link to #report lands with the heading clear of the
              // sticky site header.
              scrollMarginTop="80px"
            >
              <PageContainer>
                <Grid
                  templateColumns={{
                    base: 'minmax(0, 1fr)',
                    lg: 'minmax(0, 5fr) minmax(0, 6fr)',
                  }}
                  columnGap={{ lg: 16, xl: 24 }}
                  rowGap={{ base: 8, md: 10 }}
                  alignItems="start"
                >
                  {scene ? (
                    <>
                      <Reveal>
                        <Stack gap={{ base: 4, md: 5 }} maxW="36rem">
                          {head}
                          {body}
                        </Stack>
                      </Reveal>
                      <Box minW={0}>{scene}</Box>
                    </>
                  ) : (
                    // No scene: the heading on the left, the text in the
                    // scene's column, as on the legal pages.
                    <>
                      <Reveal>{head}</Reveal>
                      <Reveal delayMs={80}>
                        <Box maxW="40rem">{body}</Box>
                      </Reveal>
                    </>
                  )}
                </Grid>
              </PageContainer>
            </Box>
          </Fragment>
        )
      })}
    </MarketingFrame>
  )
}
