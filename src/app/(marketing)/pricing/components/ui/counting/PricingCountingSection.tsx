import { Grid, Heading, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { Reveal } from '@/app/(marketing)/components/ui/landing/Reveal'
import { BENTO_CELL_PY } from '@/app/(marketing)/components/ui/landing/bento/BentoSection'
import type { PhoneCopy } from '@/app/(marketing)/components/ui/landing/phone/phoneCopy'
import { formatMessage } from '@/i18n/loadPageI11n'
import { PAGE_GUTTER_X } from '@/theme/pageContainer'
import { PageBleed } from '@/ui/PageContainer'

import type { PricingRecord } from '../../../helpers/getPricingForPage'
import {
  type CountingCopy,
  EditedQuoteSnippet,
  FreeQuotesSnippet,
  UnlimitedSnippet,
} from './PricingCountingSnippets'
import { countingDemoTasks } from './countingDemoTasks'

type CellKey = 'free' | 'edits' | 'unlimited'
const CELLS: readonly CellKey[] = ['free', 'edits', 'unlimited']

/** A cell's heading id: it names the cell's snippet and, together, the section. */
export const countingTitleId = (key: CellKey) => `pricing-counting-${key}-title`

/**
 * How quotes are counted (FE-552), laid out like Home's bento: three cells
 * divided by hairlines, each a title and body over a small live snippet on a
 * `bg.canvas` panel. The free allowance fills up; an edited quote leaves the
 * meter where it was; Slashie Unlimited has no meter at all. The allowance
 * and the plan's name are the live ones from the API.
 *
 * From `lg` the cells sit side by side and share their rows, so the panels
 * start on one line; below that they stack, and from `md` each cell sets its
 * text beside its snippet. Each cell's title is an h2; the three name the
 * section.
 */
export function PricingCountingSection({
  pricing,
  copy,
  phone,
}: {
  pricing: PricingRecord
  copy: CountingCopy
  phone: PhoneCopy
}) {
  const count = pricing.freeQuotesPerMonth
  const vars = { count, product: pricing.productName }
  const tasks = countingDemoTasks(phone)
  const [first, second, third, fourth] = tasks

  const snippets: Record<CellKey, ReactNode> = {
    free: (
      <FreeQuotesSnippet
        copy={copy.snippet}
        tasks={[first, second, third]}
        count={count}
        labelledBy={countingTitleId('free')}
      />
    ),
    edits: (
      <EditedQuoteSnippet
        copy={copy.snippet}
        task={second}
        // The demo's other price stands in for the one before the edit.
        wasPrice={third.price}
        count={count}
        labelledBy={countingTitleId('edits')}
      />
    ),
    unlimited: (
      <UnlimitedSnippet
        copy={copy.snippet}
        productName={pricing.productName}
        // Quotes past the free allowance: the fourth task, then the first again.
        tasks={[fourth, first]}
        labelledBy={countingTitleId('unlimited')}
      />
    ),
  }

  return (
    <PageBleed
      as="section"
      data-pricing-counting=""
      aria-labelledby={CELLS.map(countingTitleId).join(' ')}
      bg="bg.surface"
      gutters="none"
    >
      <Grid
        templateColumns={{
          base: 'minmax(0, 1fr)',
          lg: 'repeat(3, minmax(0, 1fr))',
        }}
        templateRows={{ lg: 'auto 1fr' }}
      >
        {CELLS.map((key, index) => (
          <Grid
            key={key}
            data-pricing-counting-cell={key}
            // Brings its own gutters: the page-lines check measures it.
            data-page-cell=""
            px={PAGE_GUTTER_X}
            py={BENTO_CELL_PY}
            columnGap={10}
            rowGap={{ base: 6, lg: 8 }}
            templateColumns={{
              base: 'minmax(0, 1fr)',
              md: 'repeat(2, minmax(0, 1fr))',
              lg: 'minmax(0, 1fr)',
            }}
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
                  id={countingTitleId(key)}
                  textStyle="heading-lg"
                  textWrap="balance"
                >
                  {formatMessage(copy[key].title, vars)}
                </Heading>
                <Text textStyle="text-md" color="text.muted">
                  {formatMessage(copy[key].body, vars)}
                </Text>
              </Stack>
            </Reveal>
            {snippets[key]}
          </Grid>
        ))}
      </Grid>
    </PageBleed>
  )
}
