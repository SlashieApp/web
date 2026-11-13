import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import type { LegalDocument } from '@/content/legal/types'
import { Link } from '@/ui'
import { PageContainer } from '@/ui/PageContainer'

import { CentredHero } from './CentredHero'
import { type LegalColumn, LegalEyebrow } from './LegalEyebrow'
import { MarketingFrame, SECTION_PY, SectionRule } from './MarketingFrame'

const EMAIL_PATTERN = /([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi

/**
 * The reading column's measure, in `em` so it follows the text's own size (the
 * intro is 18px, the body 16px). Geist sets English prose at about 0.46em per
 * character, so 32em holds about 70 characters per line (the spec's 65 to 75)
 * and is also a comfortable 32 characters of Chinese. It is not set in `ch`:
 * the width of a "0" in Geist is 1.4 times the average letter, so 62ch would
 * run to about 90 characters. A story measures it on the real copy.
 */
export const LEGAL_MEASURE = '32em'

/**
 * Clears the marketing header (58 / 66px with its borders) and 16px, so a
 * section reached by its `id` is not under it. There is no page bar under the
 * header any more (FE-557).
 */
const ANCHOR_CLEARANCE = { base: '74px', md: '82px' } as const

/** The hero's heading id: the page's h1, which names the hero and the policy. */
export const LEGAL_HERO_HEADING_ID = 'legal-hero-heading'

/**
 * One row of the document: its heading on the left and its text in the reading
 * column on the right from `lg`; stacked, heading first, below. The row's
 * hairline above is the page's one vocabulary for lists (the steps, the
 * questions); the first row takes none, the page's rule above it does that.
 */
const ROW_GRID = {
  display: 'grid',
  gridTemplateColumns: {
    base: 'minmax(0, 1fr)',
    lg: 'minmax(0, 4fr) minmax(0, 8fr)',
  },
  columnGap: { lg: 12 },
  rowGap: 4,
} as const

const ROW_PY = { base: 8, lg: 10 } as const

/**
 * What the policy section keeps under its last row: a section's worth. It keeps
 * none above the first row: the rule under the hero is that row's
 * hairline, and the row brings the same padding every row has, so the document
 * does not open on a void (128px over the intro against 40px between the rows).
 */
const POLICY_PB = SECTION_PY

const EMPTY_HEADING_CELL = (
  <Box aria-hidden display={{ base: 'none', lg: 'block' }} />
)

/**
 * Renders plain policy copy, turning email addresses into mailto links so the
 * content files stay markup-free. A link inside a sentence is underlined at
 * rest: green 800 against the grey body text is 1.1:1 (and 2.7:1 against the
 * ink intro), far under the 3:1 that would let colour alone mark it
 * (WCAG 1.4.1), so the underline is what tells the link from the text.
 */
export function linkifyEmails(paragraph: string): ReactNode[] {
  let offset = 0
  return paragraph.split(EMAIL_PATTERN).map((part, index) => {
    // Key by character offset: unique and stable for static copy.
    const key = `${offset}`
    offset += part.length
    // Odd indexes are the captured email matches; even parts are plain text
    // (strings need no key).
    return index % 2 === 1 ? (
      <Link
        key={key}
        href={`mailto:${part}`}
        textDecoration="underline"
        textUnderlineOffset="3px"
      >
        {part}
      </Link>
    ) : (
      part
    )
  })
}

/**
 * Shared prose shell for the public legal pages (/terms, /privacy, /cookies),
 * in the marketing frame: a white page, from `lg` a rail down each side of the
 * page column. The top is Home's centred hero (FE-557, as on Pricing, About
 * and Safety): the footer's column name as the eyebrow ("Legal"), the title
 * (the one h1), the document's description and "Last updated". A full-width
 * rule, then the policy, an article named by the title: the intro, then each
 * section as a hairline row with its heading (an h2, `heading-lg`) beside its
 * text, which sits in a 65 to 75 character reading column (`LEGAL_MEASURE`).
 * Copy comes from each page's `i11n.json` so it can change without touching
 * UI. The footer stays under the frame (the page adds it).
 */
export function LegalPageLayout({
  document,
  column = 'legal',
}: {
  document: LegalDocument & { lastUpdatedLabel?: string }
  /** The footer column the page sits in, for the eyebrow over its title. */
  column?: LegalColumn
}) {
  const intro = document.intro ?? []
  const hasIntro = intro.length > 0
  const lastIndex = document.sections.length - 1

  return (
    <MarketingFrame bg="bg.surface">
      <CentredHero
        headingId={LEGAL_HERO_HEADING_ID}
        heading={document.title}
        body={document.description}
        eyebrow={<LegalEyebrow column={column} />}
        note={
          <Text data-legal-updated="" textStyle="text-sm" color="text.muted">
            {`${document.lastUpdatedLabel ?? 'Last updated'}: ${document.lastUpdated}`}
          </Text>
        }
        data-legal-hero=""
      />
      <SectionRule />
      <Box
        as="article"
        aria-labelledby={LEGAL_HERO_HEADING_ID}
        data-legal-document=""
        pb={POLICY_PB}
      >
        <PageContainer>
          {hasIntro ? (
            <Box
              data-legal-intro=""
              {...ROW_GRID}
              pt={ROW_PY}
              // With no sections the intro is the whole document.
              pb={lastIndex < 0 ? 0 : ROW_PY}
            >
              {EMPTY_HEADING_CELL}
              <Stack gap={4}>
                {intro.map((paragraph) => (
                  <Text
                    key={paragraph.slice(0, 32)}
                    textStyle="text-lg"
                    color="text.default"
                    maxW={LEGAL_MEASURE}
                  >
                    {linkifyEmails(paragraph)}
                  </Text>
                ))}
              </Stack>
            </Box>
          ) : null}
          {document.sections.map((section, index) => (
            <Box
              key={section.heading}
              id={section.id}
              data-legal-section=""
              {...ROW_GRID}
              borderTopWidth={index === 0 && !hasIntro ? 0 : '1px'}
              borderColor="border.default"
              pt={ROW_PY}
              pb={index === lastIndex ? 0 : ROW_PY}
              scrollMarginTop={ANCHOR_CLEARANCE}
            >
              <Heading
                as="h2"
                textStyle="heading-lg"
                textWrap="balance"
                color="text.default"
              >
                {section.heading}
              </Heading>
              <Stack gap={4}>
                {section.body.map((paragraph) => (
                  <Text
                    key={paragraph.slice(0, 32)}
                    textStyle="text-md"
                    color="text.muted"
                    maxW={LEGAL_MEASURE}
                  >
                    {linkifyEmails(paragraph)}
                  </Text>
                ))}
              </Stack>
            </Box>
          ))}
        </PageContainer>
      </Box>
    </MarketingFrame>
  )
}
