import {
  TaskSuspensionReason,
  TaskTimelineEventType as Type,
} from '@codegen/schema'

import { formatMessage } from '@/i18n/loadPageI11n'

import type bag from '../i11n.json'

/** The Activity copy (`activity` in `../i11n.json`) in the viewer's language. */
export type TaskActivityCopy = (typeof bag)['en']['activity']

/** What a line is about. Each kind has its own icon. */
export type TaskActivityKind = 'task' | 'quote' | 'booking' | 'review'

type ActivityPerson = {
  id: string
  profile?: { name?: string | null } | null
}

/** One `Task.timeline` event as `Task.gql` selects it. */
export type TaskActivityEvent = {
  type: string
  timestamp: string
  /** The viewer did it. */
  byViewer: boolean
  /** Null when the viewer may not know who, or nobody acted. */
  actor?: ActivityPerson | null
  /** The worker a quote or booking event is about (owner and that worker only). */
  worker?: ActivityPerson | null
  /** `TASK_UPDATED` only. */
  changedFields?: readonly string[] | null
  /** `TASK_SUSPENDED` and `TASK_UNSUSPENDED` only: which suspension. */
  suspensionReason?: string | null
}

/** Who is reading the log. */
export type TaskActivityViewer = {
  /** Null when signed out. */
  userId: string | null
  /** The viewer posted the task. */
  isOwner: boolean
}

export type TaskActivityLine = {
  key: string
  kind: TaskActivityKind
  /** The sentence, e.g. "Sam sent a quote". */
  text: string
  /** When it happened (ISO). */
  at: string
}

type EventLine = {
  kind: TaskActivityKind
  /** Null leaves the line out (a suspension line with no reason). */
  text: (
    event: TaskActivityEvent,
    viewer: TaskActivityViewer,
    copy: TaskActivityCopy,
  ) => string | null
  /**
   * Only the owner and the task's parties get it (BE-108's suspension
   * lines), so the owner's guest preview leaves it out.
   */
  partiesOnly?: true
}

/** The person's profile name, or "Someone" when it's empty. */
function nameOf(
  person: ActivityPerson | null | undefined,
  copy: TaskActivityCopy,
): string {
  return person?.profile?.name?.trim() || copy.someone
}

/**
 * The "you" form when the viewer did it, the named form when they may know
 * who did, else the anon form. Types without an anon form fall back to the
 * named form with "Someone".
 */
function byActor(
  forms: { you: string; named: string; anon?: string },
  event: TaskActivityEvent,
  copy: TaskActivityCopy,
  vars: Record<string, string> = {},
): string {
  if (event.byViewer) return formatMessage(forms.you, vars)
  if (event.actor) {
    return formatMessage(forms.named, {
      ...vars,
      name: nameOf(event.actor, copy),
    })
  }
  if (forms.anon != null) return formatMessage(forms.anon, vars)
  return formatMessage(forms.named, { ...vars, name: copy.someone })
}

/**
 * The owner booking one worker's quote. The owner reads that worker's name,
 * the worker reads "your quote", and everyone else the anon form. A line that
 * would need a name nobody sent reads like anyone else's (the same choices as
 * the Expo app).
 */
function aboutQuote(
  forms: { owner: string; own: string; anon: string },
  event: TaskActivityEvent,
  viewer: TaskActivityViewer,
  copy: TaskActivityCopy,
): string {
  const { actor, worker } = event
  if (viewer.isOwner) {
    const name = worker?.profile?.name?.trim()
    return name ? formatMessage(forms.owner, { worker: name }) : forms.anon
  }
  const ownQuote = Boolean(viewer.userId && worker?.id === viewer.userId)
  if (!ownQuote) return forms.anon
  return actor
    ? formatMessage(forms.own, { name: nameOf(actor, copy) })
    : forms.anon
}

/** "title, budget and timing" / "標題、預算、時間". Unknown fields are left out. */
function changedFieldsLabel(
  fields: readonly string[] | null | undefined,
  copy: TaskActivityCopy,
): string {
  const labels: Record<string, string | undefined> = copy.fields
  const words = [...new Set(fields ?? [])]
    .map((field) => labels[field])
    .filter((word): word is string => Boolean(word))
  if (words.length < 2) return words[0] ?? ''
  return `${words.slice(0, -1).join(copy.fieldsSeparator)}${copy.fieldsLastSeparator}${words.at(-1)}`
}

// Partial: a type the API adds before this file knows it, or has dropped since, is skipped and doesn't break the build.
const EVENT_LINES: Partial<Record<Type, EventLine>> = {
  [Type.TaskCreated]: {
    kind: 'task',
    text: (e, _, c) => byActor(c.events.TASK_CREATED, e, c),
  },
  [Type.TaskUpdated]: {
    kind: 'task',
    text: (e, _, c) => {
      const forms = c.events.TASK_UPDATED
      const fields = changedFieldsLabel(e.changedFields, c)
      if (!fields) return byActor(forms, e, c)
      return byActor(
        {
          you: forms.youFields,
          named: forms.namedFields,
          anon: forms.anonFields,
        },
        e,
        c,
        { fields },
      )
    },
  },
  [Type.TaskCancelled]: {
    kind: 'task',
    text: (e, _, c) => byActor(c.events.TASK_CANCELLED, e, c),
  },
  [Type.TaskReopened]: {
    kind: 'task',
    text: (e, _, c) => byActor(c.events.TASK_REOPENED, e, c),
  },
  [Type.TaskSuspended]: {
    kind: 'task',
    partiesOnly: true,
    text: (e, _, c) => {
      if (e.suspensionReason === TaskSuspensionReason.Slashie) {
        return c.events.TASK_SUSPENDED.SLASHIE
      }
      if (e.suspensionReason === TaskSuspensionReason.PosterSuspended) {
        return c.events.TASK_SUSPENDED.POSTER_SUSPENDED
      }
      return null
    },
  },
  [Type.TaskUnsuspended]: {
    kind: 'task',
    partiesOnly: true,
    text: (_, __, c) => c.events.TASK_UNSUSPENDED,
  },
  [Type.QuoteSent]: {
    kind: 'quote',
    text: (e, _, c) => byActor(c.events.QUOTE_SENT, e, c),
  },
  [Type.QuoteUpdated]: {
    kind: 'quote',
    text: (e, _, c) => byActor(c.events.QUOTE_UPDATED, e, c),
  },
  [Type.QuoteWithdrawn]: {
    kind: 'quote',
    text: (e, _, c) => byActor(c.events.QUOTE_WITHDRAWN, e, c),
  },
  [Type.QuoteAccepted]: {
    kind: 'quote',
    text: (e, v, c) => aboutQuote(c.events.QUOTE_ACCEPTED, e, v, c),
  },
  [Type.RescheduleRequested]: {
    kind: 'booking',
    text: (e, _, c) => byActor(c.events.RESCHEDULE_REQUESTED, e, c),
  },
  [Type.RescheduleConfirmed]: {
    kind: 'booking',
    text: (e, _, c) => byActor(c.events.RESCHEDULE_CONFIRMED, e, c),
  },
  [Type.RescheduleDeclined]: {
    kind: 'booking',
    text: (e, _, c) => byActor(c.events.RESCHEDULE_DECLINED, e, c),
  },
  [Type.RescheduleWithdrawn]: {
    kind: 'booking',
    text: (e, _, c) => byActor(c.events.RESCHEDULE_WITHDRAWN, e, c),
  },
  [Type.CancellationRequested]: {
    kind: 'booking',
    text: (e, _, c) => byActor(c.events.CANCELLATION_REQUESTED, e, c),
  },
  [Type.CancellationDeclined]: {
    kind: 'booking',
    text: (e, _, c) => byActor(c.events.CANCELLATION_DECLINED, e, c),
  },
  [Type.CancellationWithdrawn]: {
    kind: 'booking',
    text: (e, _, c) => byActor(c.events.CANCELLATION_WITHDRAWN, e, c),
  },
  [Type.CancellationLapsed]: {
    kind: 'booking',
    text: (_, __, c) => c.events.CANCELLATION_LAPSED,
  },
  [Type.OrderCancelled]: {
    kind: 'booking',
    text: (_, __, c) => c.events.ORDER_CANCELLED,
  },
  [Type.OrderMarkedDone]: {
    kind: 'booking',
    text: (e, _, c) => byActor(c.events.ORDER_MARKED_DONE, e, c),
  },
  [Type.OrderMarkedFailed]: {
    kind: 'booking',
    text: (e, _, c) => byActor(c.events.ORDER_MARKED_FAILED, e, c),
  },
  [Type.OrderConflict]: {
    kind: 'booking',
    text: (_, __, c) => c.events.ORDER_CONFLICT,
  },
  [Type.OrderCompleted]: {
    kind: 'booking',
    text: (_, __, c) => c.events.ORDER_COMPLETED,
  },
  [Type.ReviewLeft]: {
    kind: 'review',
    text: (e, _, c) => byActor(c.events.REVIEW_LEFT, e, c),
  },
}

/** How a type reads, or null for one this build doesn't know. */
function eventLine(type: string): EventLine | null {
  return Object.hasOwn(EVENT_LINES, type)
    ? (EVENT_LINES[type as Type] ?? null)
    : null
}

/**
 * Task detail's Activity log (FE-372): one line per `Task.timeline` event,
 * oldest first as the API sends them, worded for this viewer. Types this
 * build doesn't know yet are skipped.
 */
export function taskActivityLines(
  events: readonly TaskActivityEvent[],
  viewer: TaskActivityViewer,
  copy: TaskActivityCopy,
): TaskActivityLine[] {
  const lines: TaskActivityLine[] = []
  for (const event of events) {
    const line = eventLine(event.type)
    const text = line?.text(event, viewer, copy)
    if (!line || !text) continue
    lines.push({
      key: `${lines.length}:${event.type}:${event.timestamp}`,
      kind: line.kind,
      text,
      at: event.timestamp,
    })
  }
  return lines
}

/**
 * The owner's guest preview: the timeline as a signed-out visitor gets it
 * from the API (BE-106). Task lines keep the poster as who did it, quote
 * lines lose who, and booking lines, reviews and suspension lines go.
 */
export function taskTimelineAsGuest<T extends TaskActivityEvent>(
  events: readonly T[] | null | undefined,
  posterId: string | null | undefined,
): T[] {
  return (events ?? []).flatMap((event) => {
    const line = eventLine(event.type)
    if (line?.partiesOnly) return []
    const kind = line?.kind
    if (kind === 'task') {
      const byPoster = Boolean(posterId && event.actor?.id === posterId)
      const actor = byPoster ? event.actor : null
      return [{ ...event, actor, worker: null, byViewer: false } as T]
    }
    if (kind === 'quote') {
      return [{ ...event, actor: null, worker: null, byViewer: false } as T]
    }
    return []
  })
}

/**
 * When a line happened: "22 Oct, 14:05" in en-GB, "10月22日 14:05" in
 * zh-HK, with the year when it isn't this year. `timeZone` is for tests;
 * the page uses the device's.
 */
export function formatTaskActivityTime(
  iso: string,
  locale: string,
  { now = new Date(), timeZone }: { now?: Date; timeZone?: string } = {},
): string {
  const at = new Date(iso)
  if (Number.isNaN(at.getTime())) return ''
  const year = (date: Date) =>
    new Intl.DateTimeFormat('en-GB', { year: 'numeric', timeZone }).format(date)
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    ...(year(at) === year(now) ? {} : { year: 'numeric' }),
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone,
  }).format(at)
}
