'use client'

import { Box, Flex, Heading, Skeleton, Stack, Text } from '@chakra-ui/react'
import type { ComponentType } from 'react'

import { useI11n } from '@/i18n/useI11n'
import { TASK_ORDER_SECTION_ID } from '@/utils/orderHelpers'
import { formatBudgetAmount } from '@/utils/price'
import { Card } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TASK_DETAIL_SECTION_CARD } from '../../helpers/taskDetailLayout'
import { orderCounterpart } from '../../helpers/taskDetailUtils'
import bag from '../../i11n.json'
import {
  TASK_DETAIL_VIEWS,
  type TaskDetailViewConfig,
  type TaskSummaryFact,
  liveQuoteCount,
} from '../../views'
import {
  resolveSummaryCopy,
  summaryBudgetType,
} from '../../views/resolveSummaryCopy'
import { TaskDetailMainCta } from '../layout/TaskDetailMainCta'
import {
  BookingActionsFact,
  CloseSwitchFact,
  ConflictActionsFact,
  RequestFact,
} from './facts/BookingActionFacts'
import {
  AgreedPriceFact,
  OtherPartyFact,
  RecordFact,
  RepostFact,
  ReviewsFact,
} from './facts/BookingFacts'
import {
  BookedTimeFact,
  BudgetFact,
  CategoriesFact,
  DescriptionFact,
  LocationFact,
  MyQuoteFact,
  PaymentFact,
  PostedByFact,
  PreferredTimeFact,
  useDateLocale,
} from './facts/TaskFacts'

const SUMMARY_FACTS: Record<TaskSummaryFact, ComponentType> = {
  budget: BudgetFact,
  payment: PaymentFact,
  myQuote: MyQuoteFact,
  preferredTime: PreferredTimeFact,
  bookedTime: BookedTimeFact,
  location: LocationFact,
  categories: CategoriesFact,
  postedBy: PostedByFact,
  otherParty: OtherPartyFact,
  agreedPrice: AgreedPriceFact,
  description: DescriptionFact,
  request: RequestFact,
  bookingActions: BookingActionsFact,
  conflictActions: ConflictActionsFact,
  closeSwitch: CloseSwitchFact,
  record: RecordFact,
  reviews: ReviewsFact,
  repost: RepostFact,
}

/** Hairline between facts; a fact with nothing to show renders nothing. */
const FACT_DIVIDERS = {
  '& > * + *': { borderTopWidth: '1px', borderTopColor: 'border.default' },
} as const

/** The view's headline and sub-line, with counts, names and dates filled in. */
function useSummaryLines(config: TaskDetailViewConfig) {
  const { task, myOrder, orderClose, permissions } = useTaskDetail()
  const t = useI11n(bag)
  const locale = useDateLocale()
  if (!task) return { headline: null, subline: null }

  const amount = task.budget ? formatBudgetAmount(task.budget, '') : ''
  const params = {
    count: liveQuoteCount(task.quotes),
    budgetType: summaryBudgetType(task.budget?.type, amount),
    amount,
    name: myOrder
      ? orderCounterpart(task, myOrder, permissions.isOwner, t).name
      : '',
    date:
      orderClose?.autoDoneAt?.toLocaleDateString(locale, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }) ?? '',
  }
  return {
    headline: resolveSummaryCopy(config.headline, params, t.summary),
    subline: resolveSummaryCopy(config.subline, params, t.summary),
  }
}

/**
 * Task summary (FE-274): a headline, one sub-line saying what to do next,
 * then the facts that matter in the order the view lists them. The view is
 * worked out by `getTaskDetailView`; this only renders its config. On web
 * the main button sits in the header; compact pins it to the bottom.
 */
export function TaskSummary() {
  const { view, mainCta, jobActionError } = useTaskDetail()
  const t = useI11n(bag)
  const config = TASK_DETAIL_VIEWS[view]
  const { headline, subline } = useSummaryLines(config)

  return (
    <Card
      {...TASK_DETAIL_SECTION_CARD}
      id={TASK_ORDER_SECTION_ID}
      scrollMarginTop="140px"
      aria-busy={headline ? undefined : true}
      header={
        <Flex
          columnGap={6}
          rowGap={4}
          wrap="wrap"
          align="flex-start"
          justify="space-between"
        >
          <Stack gap={1} flex="1 1 16rem" minW={0} aria-live="polite">
            <Text
              fontSize="xs"
              fontWeight={500}
              color="text.muted"
              letterSpacing="0.06em"
              textTransform="uppercase"
            >
              {t.summary.heading}
            </Text>
            {headline ? (
              <Heading
                as="h2"
                fontSize="lg"
                fontWeight={700}
                lineHeight="short"
                color="text.default"
              >
                {headline}
              </Heading>
            ) : (
              <Skeleton h="28px" w="60%" borderRadius="md" />
            )}
            {subline ? (
              <Text fontSize="sm" color="text.muted" lineHeight="short">
                {subline}
              </Text>
            ) : headline ? null : (
              <Skeleton h="20px" w="85%" borderRadius="md" />
            )}
          </Stack>
          {mainCta ? (
            <Box
              display={{ base: 'none', lg: 'block' }}
              flex="1 1 18rem"
              maxW="24rem"
              minW={0}
              ml="auto"
            >
              <TaskDetailMainCta />
            </Box>
          ) : null}
        </Flex>
      }
    >
      {jobActionError ? (
        <Text fontSize="sm" color="status.danger.fg" role="alert">
          {jobActionError}
        </Text>
      ) : null}
      <Stack gap={0} css={FACT_DIVIDERS}>
        {config.facts.map((fact) => {
          const Fact = SUMMARY_FACTS[fact]
          return <Fact key={fact} />
        })}
      </Stack>
    </Card>
  )
}
