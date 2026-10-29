import { Box, Grid, Heading, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'

import { Reveal } from '../Reveal'
import type { PhoneCopy, StoryCopy } from '../phone/phoneCopy'
import { AcceptedSnippet, PostSnippet, QuotesSnippet } from './BentoSnippets'

/** The three customer steps the bento shows (`landing.story.customer.steps`). */
export type BentoSteps = Pick<
  StoryCopy['customer']['steps'],
  'post' | 'quotes' | 'hire'
>

type BentoKey = keyof BentoSteps

/** The cells, in reading order. */
const BENTO_KEYS: readonly BentoKey[] = ['post', 'quotes', 'hire']

/** A cell's heading id: it names the cell's snippet and, together, the section. */
export const bentoTitleId = (key: BentoKey) => `bento-${key}-title`

/**
 * A cell's vertical padding. Cells touch the section rules, so this is the
 * section's own rhythm (the frame's `SECTION_PY`): 56px on a phone up to 128px
 * on a wide screen, a step tighter where the cells stack.
 */
export const BENTO_CELL_PY = { base: 12, md: 14, lg: 24, xl: 32 } as const

function snippetFor(key: BentoKey, phone: PhoneCopy): ReactNode {
  const labelledBy = bentoTitleId(key)
  switch (key) {
    case 'post':
      return <PostSnippet phone={phone} labelledBy={labelledBy} />
    case 'quotes':
      return <QuotesSnippet phone={phone} labelledBy={labelledBy} />
    case 'hire':
      return <AcceptedSnippet phone={phone} labelledBy={labelledBy} />
  }
}

/**
 * The bento (tone refresh, train 2, item 3): the customer's three steps as
 * three cells divided by hairlines, each a title and body (today's strings)
 * over a small live product snippet on a `bg.canvas` panel.
 *
 * From `lg` the cells sit side by side between the frame's rails, divided by
 * 1px `border.default` lines, and share their rows (a subgrid), so the three
 * titles' bodies end together and the three panels start on one line whatever
 * the copy's length. Below `lg` they stack with a hairline between them; from
 * `md` each cell sets its text beside its snippet.
 *
 * The section is opaque (`bg.surface`), like the map panel: the 3D scene stays
 * behind it, so a prop never crosses a title or a row.
 *
 * The section has no heading of its own: the strings are today's, and the only
 * new ones allowed are the how-it-works index's labels. So each cell's title is
 * an h2 and the section landmark is named by the three of them.
 */
export function BentoSection({
  steps,
  phone,
}: {
  steps: BentoSteps
  phone: PhoneCopy
}) {
  return (
    <Box
      as="section"
      aria-labelledby={BENTO_KEYS.map(bentoTitleId).join(' ')}
      data-bento=""
      bg="bg.surface"
    >
      <Grid
        maxW={PAGE_CONTAINER_MAX_W}
        mx="auto"
        templateColumns={{
          base: 'minmax(0, 1fr)',
          lg: 'repeat(3, minmax(0, 1fr))',
        }}
        templateRows={{ lg: 'auto 1fr' }}
      >
        {BENTO_KEYS.map((key, index) => (
          <Grid
            key={key}
            data-bento-cell={key}
            px={PAGE_GUTTER_X}
            py={BENTO_CELL_PY}
            columnGap={10}
            rowGap={{ base: 6, lg: 8 }}
            templateColumns={{
              base: 'minmax(0, 1fr)',
              md: 'repeat(2, minmax(0, 1fr))',
              lg: 'minmax(0, 1fr)',
            }}
            // From lg every cell spans both rows and shares them.
            gridRow={{ lg: 'span 2' }}
            templateRows={{ lg: 'subgrid' }}
            borderColor="border.default"
            borderTopWidth={{ base: index === 0 ? 0 : '1px', lg: 0 }}
            borderInlineStartWidth={{ base: 0, lg: index === 0 ? 0 : '1px' }}
          >
            <Reveal delayMs={index * 70}>
              <Stack gap={3}>
                <Heading
                  as="h2"
                  id={bentoTitleId(key)}
                  textStyle="heading-lg"
                  textWrap="balance"
                >
                  {steps[key].title}
                </Heading>
                <Text textStyle="text-md" color="text.muted">
                  {steps[key].body}
                </Text>
              </Stack>
            </Reveal>
            {snippetFor(key, phone)}
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
