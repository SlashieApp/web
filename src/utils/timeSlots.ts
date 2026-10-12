import type { TimeSlotInput } from '@codegen/schema'

/** A proposed or booked window. `start`/`end` are ISO instants from the API. */
export type TimeSlotLike = {
  start: unknown
  end?: unknown
}

/** One slot as typed into the picker (local wall time). */
export type TimeSlotDraft = {
  /** `YYYY-MM-DD` in the viewer's timezone. */
  date: string
  /** `HH:mm` in the viewer's timezone. */
  time: string
  /** Optional length; the API accepts 15 to 1440 minutes. */
  durationMinutes: number | null
}

export const TIME_SLOT_MAX = 2
export const TIME_SLOT_DURATION_MIN = 15
export const TIME_SLOT_DURATION_MAX = 1440
const TIME_SLOT_HORIZON_DAYS = 366

/** Picker presets; `null` means "no set end". */
export const TIME_SLOT_DURATION_PRESETS: ReadonlyArray<number | null> = [
  null,
  30,
  60,
  120,
  180,
  240,
  480,
]

function toDate(value: unknown): Date | null {
  if (value == null || value === '') return null
  const d = new Date(String(value))
  return Number.isNaN(d.getTime()) ? null : d
}

export function timeSlotStart(slot: TimeSlotLike): Date | null {
  return toDate(slot.start)
}

export function isTimeSlotPast(slot: TimeSlotLike, now = new Date()): boolean {
  const start = timeSlotStart(slot)
  return !start || start.getTime() <= now.getTime()
}

/** "Sat 18 Oct, 09:00–11:00" (or without the end when none is set). */
export function formatTimeSlotLabel(
  slot: TimeSlotLike,
  locale = 'en-GB',
): string {
  const start = timeSlotStart(slot)
  if (!start) return ''
  const day = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(start)
  const clock = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })
  const end = toDate(slot.end)
  const times = end
    ? `${clock.format(start)}–${clock.format(end)}`
    : clock.format(start)
  return `${day}, ${times}`
}

/** Local wall time → absolute instant. Null when the draft is incomplete. */
export function timeSlotDraftStart(draft: TimeSlotDraft): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date)) return null
  if (!/^\d{2}:\d{2}$/.test(draft.time)) return null
  return toDate(`${draft.date}T${draft.time}`)
}

export type TimeSlotDraftError =
  | 'incomplete'
  | 'past'
  | 'too_far'
  | 'duplicate'
  | 'duration'

/**
 * Mirrors the API's slot rules so the form can explain problems before
 * submit: complete, in the future, within a year, distinct starts, and a
 * duration of 15 to 1440 minutes.
 */
export function validateTimeSlotDrafts(
  drafts: readonly TimeSlotDraft[],
  now = new Date(),
): Array<TimeSlotDraftError | null> {
  const horizon = now.getTime() + TIME_SLOT_HORIZON_DAYS * 24 * 60 * 60 * 1000
  const starts = drafts.map((d) => timeSlotDraftStart(d)?.getTime() ?? null)
  return drafts.map((draft, i) => {
    const start = starts[i]
    if (start == null) return 'incomplete'
    if (start <= now.getTime()) return 'past'
    if (start > horizon) return 'too_far'
    if (starts.indexOf(start) !== i) return 'duplicate'
    const d = draft.durationMinutes
    if (
      d != null &&
      (!Number.isInteger(d) ||
        d < TIME_SLOT_DURATION_MIN ||
        d > TIME_SLOT_DURATION_MAX)
    ) {
      return 'duration'
    }
    return null
  })
}

export function timeSlotInputsFromDrafts(
  drafts: readonly TimeSlotDraft[],
): TimeSlotInput[] {
  return drafts.flatMap((draft) => {
    const start = timeSlotDraftStart(draft)
    if (!start) return []
    return [
      {
        start: start.toISOString(),
        ...(draft.durationMinutes != null
          ? { durationMinutes: draft.durationMinutes }
          : {}),
      },
    ]
  })
}

/**
 * A saved slot back into the picker (local wall time), e.g. to edit a
 * quote. Past slots return null: the API only accepts future starts.
 */
export function timeSlotDraftFromSlot(
  slot: TimeSlotLike,
  now = new Date(),
): TimeSlotDraft | null {
  const start = timeSlotStart(slot)
  if (!start || start.getTime() <= now.getTime()) return null
  const end = toDate(slot.end)
  const minutes = end
    ? Math.round((end.getTime() - start.getTime()) / 60_000)
    : null
  const pad = (n: number) => String(n).padStart(2, '0')
  return {
    date: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`,
    time: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
    durationMinutes:
      minutes != null && TIME_SLOT_DURATION_PRESETS.includes(minutes)
        ? minutes
        : null,
  }
}
