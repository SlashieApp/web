'use client'

import { Heading, Skeleton, Stack, Text } from '@chakra-ui/react'
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
import { TaskStatusPill } from '../ui/TaskStatusPill'
import { CloseSwitchFact, RequestFact } from './facts/BookingActionFacts'
import {
  AgreedPriceFact,
  OtherPartyFact,
  RecordFact,
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
  PhotosFact,
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
  photos: PhotosFact,
  request: RequestFact,
  closeSwitch: CloseSwitchFact,
  record: RecordFact,
  reviews: ReviewsFact,
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
 * Task summary (FE-274): the status badge, a headline, one sub-line saying
 * what to do next, then the facts that matter in the order the view lists
 * them. The view is worked out by `getTaskDetailView`; this only renders its
 * config. A card on web; flush on phones and tablets. The main button and
 * Help & actions sit outside it.
 */
export function TaskSummary() {
  const { view, jobActionError } = useTaskDetail()
  const config = TASK_DETAIL_VIEWS[view]
  const { headline, subline } = useSummaryLines(config)

  return (
    <Card
      {...TASK_DETAIL_SECTION_CARD}
      framed={{ base: false, lg: true }}
      id={TASK_ORDER_SECTION_ID}
      scrollMarginTop="140px"
      aria-busy={headline ? undefined : true}
      header={
        <Stack gap={1.5} align="flex-start" aria-live="polite">
          {config.pill ? (
            <TaskStatusPill status={config.pill} size="sm" />
          ) : (
            <Skeleton h="22px" w="72px" borderRadius="full" />
          )}
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
