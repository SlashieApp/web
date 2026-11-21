'use client'

import { HStack, Heading, Skeleton, Stack, Text } from '@chakra-ui/react'
import { type ComponentType, useLayoutEffect, useState } from 'react'

import {
  postedMomentStorage,
  takeTaskPosted,
} from '@/app/(task)/helpers/postedMoment/postedMoment'

import { taskBudgetCustomUnit } from '@/app/(task)/helpers/taskBudget/taskBudget'
import { useI11n } from '@/i18n/useI11n'
import { sdlMotion } from '@/theme/styles'
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
  frozenSubline,
  reopenSubline,
  resolveSummaryCopy,
  summaryBudgetType,
} from '../../views/resolveSummaryCopy'
import { TaskStatusPill } from '../ui/TaskStatusPill'
import { PostedTick } from './PostedTick'
import { RequestFact } from './facts/BookingActionFacts'
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
  record: RecordFact,
  reviews: ReviewsFact,
}

/**
 * Hairline between facts; a fact with nothing to show renders nothing.
 * Photos sit straight under the description, as one block.
 */
const FACT_DIVIDERS = {
  '& > * + *': { borderTopWidth: '1px', borderTopColor: 'border.default' },
  '& > [data-fact=description] + [data-fact=photos]': {
    borderTopWidth: 0,
    paddingTop: 0,
  },
} as const

/**
 * The view's headline and sub-line, with counts, names and dates filled in.
 * While the task or booking is frozen (BE-108) the sub-line leaves out the
 * auto-Done date, which waits too; and when the owner can reopen the task
 * (BE-113) it points at Reopen task, not Repost. Messages' pins read the same.
 */
export function useSummaryLines(config: TaskDetailViewConfig) {
  const { task, myOrder, orderClose, permissions } = useTaskDetail()
  const t = useI11n(bag)
  const locale = useDateLocale()
  if (!task) return { headline: null, subline: null }

  const amount = task.budget ? formatBudgetAmount(task.budget, '') : ''
  const params = {
    count: liveQuoteCount(task.quotes),
    budgetType: summaryBudgetType(task.budget),
    amount,
    unit: taskBudgetCustomUnit(task.budget) ?? '',
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
  const subline = reopenSubline(
    permissions.isFrozen ? frozenSubline(config.subline) : config.subline,
    permissions.canReopen,
  )
  return {
    headline: resolveSummaryCopy(config.headline, params, t.summary),
    subline: resolveSummaryCopy(subline, params, t.summary),
  }
}

/**
 * The status block settling in for the "Task posted" moment: a short rise
 * with the emphasis curve's gentle overshoot, the one playful motion of the
 * landing. Reduced motion fades it in.
 */
const momentSettleCss = {
  animationName: 'moment-settle',
  animationDuration: sdlMotion.duration.slow,
  animationTimingFunction: sdlMotion.easing.emphasis,
  animationFillMode: 'both',
  '@media (prefers-reduced-motion: reduce)': {
    animationName: 'step-in-fade',
    animationDuration: sdlMotion.duration.base,
    animationTimingFunction: sdlMotion.easing.standard,
  },
} as const

/**
 * True once, on the page Post a task has just landed on (`postedMoment`).
 * Read before the first paint, so the block never shows its everyday words
 * first.
 */
function useJustPosted(taskId: string | undefined): boolean {
  const [justPosted, setJustPosted] = useState(false)
  useLayoutEffect(() => {
    if (taskId && takeTaskPosted(postedMomentStorage(), taskId)) {
      setJustPosted(true)
    }
  }, [taskId])
  return justPosted
}

/**
 * Task summary (FE-274): the status badge, a headline, one sub-line saying
 * what to do next, then the facts that matter in the order the view lists
 * them. The view is worked out by `getTaskDetailView`; this only renders its
 * config. A card on web; flush on phones and tablets. The main button and
 * Help & actions sit outside it.
 *
 * Landing here from Post a task (Ryan 22 Nov), the block plays the moment
 * once: it settles in, a tick draws beside the pill, and the headline reads
 * "Task posted". The page already says the task is live, so there is no
 * second banner; later visits read as usual.
 */
export function TaskSummary() {
  const { view, jobActionError, task } = useTaskDetail()
  const config = TASK_DETAIL_VIEWS[view]
  const lines = useSummaryLines(config)
  const t = useI11n(bag)
  // Only the view posting lands on: the owner's open task with no quotes yet.
  const posted = useJustPosted(task?.id) && view === 'owner.open.noQuotes'
  const headline =
    posted && lines.headline ? t.summary.ownerPostedHeadline : lines.headline
  const subline = lines.subline

  return (
    <Card
      {...TASK_DETAIL_SECTION_CARD}
      id={TASK_ORDER_SECTION_ID}
      scrollMarginTop="140px"
      aria-busy={headline ? undefined : true}
      header={
        <Stack
          // A new key once the words are in: the moment plays on them, not on
          // the placeholders.
          key={posted && headline ? 'posted' : 'summary'}
          data-posted-moment={posted && headline ? '' : undefined}
          gap={1.5}
          align="flex-start"
          aria-live="polite"
          transformOrigin="left center"
          css={posted && headline ? momentSettleCss : undefined}
        >
          {config.pill ? (
            <HStack gap={2}>
              {posted && headline ? <PostedTick /> : null}
              <TaskStatusPill status={config.pill} size="sm" />
            </HStack>
          ) : (
            <Skeleton h="22px" w="72px" borderRadius="full" />
          )}
          {headline ? (
            <Heading
              as="h2"
              fontSize="lg"
              fontWeight={500}
              letterSpacing="-0.01em"
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
