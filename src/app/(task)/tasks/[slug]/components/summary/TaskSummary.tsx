'use client'

import { Heading, Skeleton, Stack, Text } from '@chakra-ui/react'
import {
  type ComponentType,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

import {
  type TaskMoment,
  postedMomentStorage,
  takeTaskMoment,
  taskMomentPlaysOn,
} from '@/app/(task)/helpers/postedMoment/postedMoment'

import { taskBudgetCustomUnit } from '@/app/(task)/helpers/taskBudget/taskBudget'
import { useI11n } from '@/i18n/useI11n'
import { TASK_ORDER_SECTION_ID } from '@/utils/orderHelpers'
import { formatBudgetAmount } from '@/utils/price'
import { Card, SuccessTick, momentSettleCss } from '@ui'

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
 * What was just done on this task, once (`postedMoment`): posted, a quote
 * sent or accepted, a review left. Read before the first paint, so the block
 * never shows its everyday words first; and again when the view changes,
 * since accepting a quote happens on this page. It plays only on the view its
 * action ends on, and is over once the page moves on from it.
 */
function useTaskMoment(
  taskId: string | undefined,
  view: string,
): TaskMoment | null {
  const [moment, setMoment] = useState<TaskMoment | null>(null)
  // biome-ignore lint/correctness/useExhaustiveDependencies: a new view may carry a new moment
  useLayoutEffect(() => {
    if (!taskId) return
    const taken = takeTaskMoment(postedMomentStorage(), taskId)
    if (taken) setMoment(taken)
  }, [taskId, view])
  const playing = moment !== null && taskMomentPlaysOn(moment, view)
  // Its view has come and gone: it does not play again if the page returns.
  const seen = useRef(false)
  useEffect(() => {
    if (playing) seen.current = true
    else if (seen.current) {
      seen.current = false
      setMoment(null)
    }
  }, [playing])
  return playing ? moment : null
}

/**
 * Task summary (FE-274): a headline, one sub-line saying what to do next,
 * then the facts that matter in the order the view lists them. (The status
 * badge was its eyebrow until 22 Nov: it follows the page's title now.) The view is worked out by `getTaskDetailView`; this only renders its
 * config. A card on web; flush on phones and tablets. The main button and
 * Help & actions sit outside it.
 *
 * After posting the task, sending a quote, accepting one or leaving a review
 * (Ryan 22 Nov), the block plays the moment once: it settles in and a tick
 * draws over the headline. Where its everyday headline does not say what just
 * happened, it does for that first view: "Task posted", "Review sent". The
 * block is the confirmation, so there is no pop-up as well; later visits read
 * as usual.
 */
export function TaskSummary() {
  const { view, jobActionError, task } = useTaskDetail()
  const config = TASK_DETAIL_VIEWS[view]
  const lines = useSummaryLines(config)
  const t = useI11n(bag)
  const moment = useTaskMoment(task?.id, view)
  // A sent or accepted quote: the block already says it ("Quote sent",
  // "Worker booked"), so only the tick and the settle are added.
  const momentHeadline =
    moment === 'posted'
      ? t.summary.ownerPostedHeadline
      : moment === 'reviewSent'
        ? t.summary.reviewSentHeadline
        : moment === 'reviewSaved'
          ? t.summary.reviewSavedHeadline
          : null
  const headline =
    momentHeadline && lines.headline ? momentHeadline : lines.headline
  const playing = moment !== null && Boolean(headline)
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
          key={playing ? 'moment' : 'summary'}
          data-task-moment={playing ? moment : undefined}
          gap={1.5}
          align="flex-start"
          aria-live="polite"
          transformOrigin="left center"
          css={playing ? momentSettleCss : undefined}
        >
          {/* The status pill follows the page's title now (22 Nov); the
              moment's tick still draws here, over the headline. */}
          {playing ? <SuccessTick /> : null}
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
