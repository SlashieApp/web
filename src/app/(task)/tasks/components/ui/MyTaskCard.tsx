'use client'

import { TaskCard } from '@/app/(task)/components/ui/TaskCard'
import { taskDetailHrefFromMyTasks } from '@/app/(task)/helpers/openTaskDetailFromBrowse'
import { taskCategoryLabels } from '@/app/(task)/helpers/taskCategories'
import { useLocale, useLocalizedHref } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { TASK_ORDER_SECTION_ID } from '@/utils/orderHelpers'
import { Button, Link } from '@ui'

import type {
  MyTaskAsk,
  MyTaskHubRow,
  MyTaskTiming,
} from '../../helpers/myTasksHub'
import bag from '../../i11n.json'
import { MyTaskCardMenu } from './MyTaskCardMenu'

/** Task detail's quotes list (`QuotesModule`). */
const TASK_QUOTES_SECTION_ID = 'task-quotes'

type Copy = (typeof bag)['en']

function timingLabel(timing: MyTaskTiming, t: Copy, locale: string): string {
  switch (timing.kind) {
    case 'overdue':
      return t.timing.overdue
    case 'today':
      return timing.time
        ? formatMessage(t.timing.todayAt, { time: timing.time })
        : t.timing.today
    case 'tomorrow':
      return timing.time
        ? formatMessage(t.timing.tomorrowAt, { time: timing.time })
        : t.timing.tomorrow
    case 'flexible':
      return t.timing.flexible
    case 'before':
      return formatMessage(t.timing.before, { date: timing.date })
    case 'scheduled':
      return new Intl.DateTimeFormat(locale === 'zh-hk' ? 'zh-HK' : 'en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(timing.at))
  }
}

/** Who's on the job, how many quotes came in, or who posted it. */
function detailLine(row: MyTaskHubRow, t: Copy): string | undefined {
  if (row.acceptedWorkerName) {
    return formatMessage(t.withWorker, { name: row.acceptedWorkerName })
  }
  if (row.quoteCount > 0) {
    return formatMessage(
      row.quoteCount === 1 ? t.quoteCountOne : t.quoteCount,
      {
        count: row.quoteCount,
      },
    )
  }
  if (row.ownerName && !row.roles.includes('hosted')) {
    return formatMessage(t.hostedBy, { name: row.ownerName })
  }
  return undefined
}

/** The ask in words: "3 quotes to compare", "Alex asked to cancel". */
function askLabel(ask: MyTaskAsk, row: MyTaskHubRow, t: Copy): string {
  const asks: Record<string, string> = t.needsYou.asks
  if (ask === 'compareQuotes') {
    return row.liveQuoteCount === 1
      ? asks.compareQuotesOne
      : formatMessage(asks.compareQuotes, { count: row.liveQuoteCount })
  }
  if (ask === 'markDone' || ask === 'conflict') return asks[ask]
  return row.counterpartyName
    ? formatMessage(asks[ask], { name: row.counterpartyName })
    : asks[`${ask}NoName`]
}

/**
 * One My Tasks row on the search page's card: Hosted / Quoted (and Not
 * selected) before the categories, the time leading on booked work and in red
 * when overdue, and a ⋮ menu that fits the row. Completed rows drop the time.
 */
export function MyTaskCard({
  row,
  onOpen,
}: {
  row: MyTaskHubRow
  onOpen: (taskId: string) => void
}) {
  const t = useI11n(bag)
  const locale = useLocale()
  const localize = useLocalizedHref()
  const viewerRole = row.roles.includes('hosted') ? 'hosted' : 'quoted'
  const tags = row.notSelected ? [t.tags.notSelected] : []
  const live = row.section !== 'completed'
  const timingTone =
    live && row.timing.kind === 'overdue'
      ? 'overdue'
      : row.section === 'booked'
        ? 'lead'
        : undefined

  return (
    <TaskCard
      task={{
        id: row.id,
        title: row.title,
        description: row.description,
        location: row.location,
        priceLabel: row.priceLabel,
        categories: taskCategoryLabels(row.categories),
        viewerRole,
        distanceLabel: row.location,
        timingLabel: live ? timingLabel(row.timing, t, locale) : undefined,
        timingTone,
        quotesLabel: detailLine(row, t),
        askLabel: row.ask ? askLabel(row.ask, row, t) : undefined,
        thumbnailSrc: row.thumbnailSrc,
      }}
      tags={tags}
      menu={<MyTaskCardMenu row={row} />}
      action={
        row.ask ? (
          <Button
            asChild
            size="sm"
            minH="44px"
            w={{ base: 'full', sm: 'auto' }}
          >
            <Link
              href={localize(
                `${taskDetailHrefFromMyTasks(row.id)}#${
                  row.ask === 'compareQuotes'
                    ? TASK_QUOTES_SECTION_ID
                    : TASK_ORDER_SECTION_ID
                }`,
              )}
              _hover={{ textDecoration: 'none' }}
            >
              {t.needsYou.actions[row.ask]}
            </Link>
          </Button>
        ) : undefined
      }
      onActivate={() => onOpen(row.id)}
      navigateOnActivate
      activateAriaLabel={formatMessage(t.openTask, {
        title: row.title,
        tags: [t.tags[viewerRole], ...tags].join(', '),
      })}
    />
  )
}
