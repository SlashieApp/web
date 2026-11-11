'use client'

import type { ReactNode } from 'react'
import {
  LuArrowLeft,
  LuCalendar,
  LuCalendarClock,
  LuCalendarX,
  LuChevronRight,
  LuEllipsisVertical,
  LuEye,
  LuMapPin,
  LuMessageCircle,
  LuPencil,
  LuReceipt,
  LuShare2,
  LuShieldCheck,
  LuTag,
  LuTrash2,
  LuUser,
  LuX,
} from 'react-icons/lu'

import {
  type Act,
  Avatar,
  Button,
  Collapse,
  Count,
  Notification,
  Phone,
  Roll,
  Spinner,
  Stage,
  States,
  Window,
} from '@/app/(marketing)/components/stage'

import { StageMap } from './StageMap'
import type {
  HeroStageCopy,
  HeroStageQuote,
  HeroStageTask,
} from './heroStageCopy'
import './stageLook.css'
import './heroStage.css'

export type { HeroStageCopy } from './heroStageCopy'

/** Slashie's mark, the app icon on a notification. */
const MARK_SRC = '/images/slashie-mark.svg'

// The landing's hero scene (FE-542): the customer's own task page, drawn from
// the real one (`tasks/[slug]`, owner view) with the product's own words.
// Quotes arrive on the task and the customer accepts one.
//
// Wide (a desktop column): the web page in a browser window. The map header
// with the task's pin, the title, its chips and Preview; the summary card and
// Help & actions. The page scrolls to the Quotes card, two quotes arrive,
// Accept opens the real "Accept this quote?" dialog, and the page goes back up
// to "Awarded / Worker booked", with Your worker and Message at the top.
//
// Compact (a phone column): the same page in the app, on a phone. Each quote
// is announced by a notification, Preview is the pinned button, and the
// accept dialog is a bottom sheet.
//
// In both, a second task then gets its first quote, which is also how the
// loop resets without anything rewinding in view.

type Layout = 'wide' | 'compact'
type Dialog = 'closed' | 'open' | 'busy'

type S = {
  scene: 0 | 1
  /** Per task: arriving quotes opened, and landed (their words shown). */
  open: [number, number]
  landed: [number, number]
  /** Per task: how far its page is scrolled, in stage pixels. */
  scrolled: [number, number]
  /** The first task's accept dialog. */
  dialog: Dialog
  /** The first task is booked: the customer accepted the last quote. */
  booked: boolean
  /** The phone's notification for an arriving quote. */
  note: null | { scene: 0 | 1; i: number; out: boolean }
}

const START: S = {
  scene: 0,
  open: [0, 0],
  landed: [0, 0],
  scrolled: [0, 0],
  dialog: 'closed',
  booked: false,
  note: null,
}

/** The frame that tells the story on its own: booked, at the top of the page. */
const POSTER: S = { ...START, open: [2, 0], landed: [2, 0], booked: true }

const set2 = <T,>(pair: [T, T], i: number, v: T): [T, T] =>
  i === 0 ? [v, pair[1]] : [pair[0], v]

/** Where each task's pin sits on its map header, as fractions: [wide, compact]. */
const PINS: [[number, number], [number, number]][] = [
  [
    [0.74, 0.34],
    [0.72, 0.42],
  ],
  [
    [0.66, 0.3],
    [0.6, 0.42],
  ],
]

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  )

/** The summary's headline and subline for the owner, as the task page words them. */
function summaryText(copy: HeroStageCopy, count: number, booked: boolean) {
  const { ui } = copy
  if (booked) return { stage: 'booked' as const, headline: ui.bookedHeadline }
  if (count === 0) return { stage: 'live' as const, headline: ui.liveHeadline }
  return {
    stage: 'quotes' as const,
    headline: fill(count === 1 ? ui.quotesHeadlineOne : ui.quotesHeadlineMany, {
      count,
    }),
  }
}

/** The quote the customer accepts on the first task: the last to arrive. */
const acceptedOf = (task: HeroStageTask) => task.pulses[task.pulses.length - 1]

// ------------------------------------------------------------- the page

function Chip({
  icon,
  person,
  children,
}: {
  icon?: ReactNode
  /** The poster's chip: an avatar inset as far from the edge as from the top. */
  person?: boolean
  children: ReactNode
}) {
  return (
    <span className={person ? 'sh-chip sh-chip--person' : 'sh-chip'}>
      {icon}
      {children}
    </span>
  )
}

/** A label and its value, as the task page's detail rows. */
function DetailRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode
  label: string
  children: ReactNode
}) {
  return (
    <div className="sh-row">
      <span className="sh-row__label">
        {icon}
        {label}
      </span>
      <span className="sh-row__value">{children}</span>
    </div>
  )
}

/** One quote, as the task page's `QuoteRow` lays it out for the owner. */
function QuoteRow({
  q,
  id,
  landed,
  best,
  copy,
}: {
  q: HeroStageQuote
  id?: string
  landed: boolean
  best?: boolean
  copy: HeroStageCopy
}) {
  return (
    <div
      className="sh-quote"
      data-target={id && `row-${id}`}
      data-landed={landed || undefined}
    >
      <Avatar name={q.name} size={36} className="sh-quote__avatar" />
      <div className="sh-quote__body">
        <div className="sh-quote__line">
          <span className="sh-quote__name">{q.name}</span>
          {best ? <span className="sh-best">{copy.ui.bestMatch}</span> : null}
          <span className="sh-quote__price">£{q.price}</span>
        </div>
        <div className="sh-quote__meta">
          {q.slot} · {copy.ui.respondedJustNow}
        </div>
        <div className="sh-quote__note">{q.note}</div>
        <div className="sh-quote__actions">
          <span className="sh-chat" aria-hidden="true">
            <LuMessageCircle size={18} />
          </span>
          <Button
            variant="primary"
            size="medium"
            className="sh-accept"
            data-target={id && `accept-${id}`}
            data-cursor="hand"
          >
            {copy.ui.accept}
          </Button>
        </div>
      </div>
    </div>
  )
}

/** The main action beside the title: Preview while open, then your worker and Message. */
function MainCta({
  booked,
  worker,
  copy,
  layout,
}: {
  booked: boolean
  worker: string
  copy: HeroStageCopy
  layout: Layout
}) {
  return (
    <States
      className="sh-cta"
      align={layout === 'wide' ? 'end' : 'center'}
      value={booked ? 'booked' : 'open'}
      states={{
        open: (
          <Button
            variant="primary"
            className="sh-preview"
            icon={<LuEye size={16} aria-hidden="true" />}
          >
            {copy.ui.preview}
          </Button>
        ),
        booked: (
          <span className="sh-worker">
            <span className="sh-worker__who">
              <span className="sh-worker__label">{copy.ui.yourWorker}</span>
              <span className="sh-worker__name">{worker}</span>
            </span>
            <Button variant="primary" className="sh-worker__message">
              {copy.ui.message}
            </Button>
          </span>
        ),
      }}
    />
  )
}

function TaskPage({
  sc,
  s,
  copy,
  layout,
}: {
  sc: 0 | 1
  s: S
  copy: HeroStageCopy
  layout: Layout
}) {
  const { ui } = copy
  const t = copy.tasks[sc]
  if (!t) return null
  const booked = sc === 0 && s.booked
  const count = t.base.length + s.landed[sc]
  const { stage, headline } = summaryText(copy, count, booked)
  const accepted = acceptedOf(t)
  const pin = PINS[sc]?.[layout === 'wide' ? 0 : 1] ?? [0.7, 0.4]
  const scrolled = s.scrolled[sc]
  const compact = layout === 'compact'

  return (
    <div
      className="sh-scene"
      data-on={s.scene === sc || undefined}
      aria-hidden={s.scene !== sc || undefined}
    >
      <div className="sh-viewport" data-target={`page-${sc}`}>
        <div
          className="sh-sheet"
          data-target={`sheet-${sc}`}
          style={{ transform: `translate3d(0, ${-scrolled}px, 0)` }}
        >
          <div className="sh-maphead">
            <StageMap phone={compact} />
            <span
              className="sh-pin"
              style={{ left: `${pin[0] * 100}%`, top: `${pin[1] * 100}%` }}
            >
              £{t.budget}
            </span>
            <span className="sh-maphead__fade" />
            <div className="sh-titleblock">
              <div className="sh-titletext">
                <div className="sh-title">{t.title}</div>
                <div className="sh-chips">
                  <Chip icon={<LuMapPin size={13} aria-hidden="true" />}>
                    {t.area}
                  </Chip>
                  <Chip icon={<LuCalendar size={13} aria-hidden="true" />}>
                    {t.date}
                  </Chip>
                  <Chip icon={<LuTag size={13} aria-hidden="true" />}>
                    {t.kind}
                  </Chip>
                  <Chip person icon={<Avatar name={copy.poster} size={18} />}>
                    {copy.poster}
                    <LuChevronRight size={12} aria-hidden="true" />
                  </Chip>
                </div>
              </div>
              {compact ? null : (
                <MainCta
                  booked={booked}
                  worker={accepted?.name ?? ''}
                  copy={copy}
                  layout={layout}
                />
              )}
            </div>
          </div>

          <div className="sh-grid">
            <div className="sh-col">
              <section className="sh-card sh-summary">
                <span
                  className="sh-status"
                  data-tone={booked ? 'awarded' : 'open'}
                >
                  <span className="sh-status__dot" />
                  <Roll>{booked ? ui.awarded : ui.open}</Roll>
                </span>
                <div className="sh-headline">
                  <Roll>{headline}</Roll>
                </div>
                {/* A paragraph that wraps, as on the page: it changes in place */}
                <States
                  className="sh-subline"
                  align="start"
                  value={stage}
                  states={{
                    live: ui.liveSubline,
                    quotes: ui.quotesSubline,
                    booked: ui.bookedSubline,
                  }}
                />
                <States
                  className="sh-summary__body"
                  align="start"
                  value={booked ? 'booked' : 'open'}
                  states={{
                    open: (
                      <div className="sh-body">
                        <div className="sh-budget">
                          <span className="sh-eyebrow">{ui.budget}</span>
                          <span className="sh-budget__amount">£{t.budget}</span>
                        </div>
                        <DetailRow
                          icon={<LuCalendar size={15} aria-hidden="true" />}
                          label={ui.when}
                        >
                          <span className="sh-pill">{t.date}</span>
                        </DetailRow>
                        <DetailRow
                          icon={<LuMapPin size={15} aria-hidden="true" />}
                          label={ui.location}
                        >
                          {t.area}
                        </DetailRow>
                      </div>
                    ),
                    booked: (
                      <div className="sh-body">
                        <DetailRow
                          icon={<LuCalendar size={15} aria-hidden="true" />}
                          label={ui.schedule}
                        >
                          <span className="sh-pill">{accepted?.slot}</span>
                        </DetailRow>
                        <DetailRow
                          icon={<LuUser size={15} aria-hidden="true" />}
                          label={ui.yourWorker}
                        >
                          <span className="sh-person">
                            <Avatar name={accepted?.name ?? ''} size={20} />
                            {accepted?.name}
                          </span>
                        </DetailRow>
                        <DetailRow
                          icon={<LuReceipt size={15} aria-hidden="true" />}
                          label={ui.agreedTotal}
                        >
                          £{accepted?.price}
                        </DetailRow>
                      </div>
                    ),
                  }}
                />
              </section>

              <Collapse open={!booked} reveal="clip">
                <section
                  className="sh-card sh-quotes"
                  data-target={`quotes-${sc}`}
                >
                  <div className="sh-quotes__head">
                    <span className="sh-eyebrow">{ui.quotes}</span>
                    <span className="sh-count">
                      <Count value={count} duration={500} />
                    </span>
                  </div>
                  <div className="sh-list" data-target={`list-${sc}`}>
                    {/* Newest first: each new quote opens at the top and pushes the rest down */}
                    {t.pulses
                      .map((q, i) => ({ q, i }))
                      .reverse()
                      .map(({ q, i }) => (
                        <Collapse
                          key={q.name}
                          open={s.open[sc] > i}
                          reveal="clip"
                        >
                          <QuoteRow
                            q={q}
                            id={`${sc}-${i}`}
                            landed={s.landed[sc] > i}
                            best={sc === 0 && i === t.pulses.length - 1}
                            copy={copy}
                          />
                        </Collapse>
                      ))}
                    {t.base.map((q) => (
                      <QuoteRow key={q.name} q={q} landed copy={copy} />
                    ))}
                  </div>
                </section>
              </Collapse>
            </div>

            {compact ? null : (
              <div className="sh-rail">
                <section className="sh-card sh-help">
                  <span className="sh-eyebrow">{ui.helpHeading}</span>
                  <States
                    className="sh-help__list"
                    align="start"
                    value={booked ? 'booked' : 'open'}
                    states={{
                      open: (
                        <div className="sh-actions">
                          <span className="sh-action">
                            <LuShare2 size={18} aria-hidden="true" />
                            {ui.shareTask}
                          </span>
                          <span className="sh-action" data-tone="link">
                            <LuPencil size={18} aria-hidden="true" />
                            {ui.editTask}
                          </span>
                          <span className="sh-action" data-tone="link">
                            <LuShieldCheck size={18} aria-hidden="true" />
                            {ui.payingSafely}
                          </span>
                          <span className="sh-action" data-tone="danger">
                            <LuTrash2 size={18} aria-hidden="true" />
                            {ui.cancelTask}
                          </span>
                        </div>
                      ),
                      booked: (
                        <div className="sh-actions">
                          <span className="sh-action">
                            <LuCalendarClock size={18} aria-hidden="true" />
                            {ui.reschedule}
                          </span>
                          <span className="sh-action" data-tone="danger">
                            <LuCalendarX size={18} aria-hidden="true" />
                            {ui.cancelBooking}
                          </span>
                          <span className="sh-action">
                            <LuShare2 size={18} aria-hidden="true" />
                            {ui.shareTask}
                          </span>
                          <span className="sh-action" data-tone="link">
                            <LuShieldCheck size={18} aria-hidden="true" />
                            {ui.payingSafely}
                          </span>
                        </div>
                      ),
                    }}
                  />
                </section>
                <Collapse open={!booked} reveal="clip">
                  <section className="sh-card sh-analytics">
                    <span className="sh-eyebrow">{ui.analytics}</span>
                    <div className="sh-stat">
                      <span>{ui.views}</span>
                      <span className="sh-stat__value">{t.views}</span>
                    </div>
                    <div className="sh-stat">
                      <span>{ui.quotes}</span>
                      <span className="sh-stat__value">
                        <Count value={count} duration={500} />
                      </span>
                    </div>
                  </section>
                </Collapse>
              </div>
            )}
          </div>
        </div>

        {/* The page header's bar (FE-458): over the map at the top, solid with the title once scrolled */}
        <div className="sh-appbar" data-solid={scrolled > 0 || undefined}>
          <span className="sh-iconbtn">
            <LuArrowLeft size={18} aria-hidden="true" />
          </span>
          <span className="sh-appbar__title">{t.title}</span>
          <span className="sh-iconbtn">
            <LuEllipsisVertical size={18} aria-hidden="true" />
          </span>
        </div>

        {compact ? (
          // The accept sheet covers the pinned button while it is open
          <div
            className="sh-pinbar"
            data-covered={(sc === 0 && s.dialog !== 'closed') || undefined}
          >
            <MainCta
              booked={booked}
              worker={accepted?.name ?? ''}
              copy={copy}
              layout={layout}
            />
          </div>
        ) : null}

        {sc === 0 ? (
          <AcceptDialog
            state={s.dialog}
            quote={accepted}
            copy={copy}
            layout={layout}
          />
        ) : null}
      </div>
    </div>
  )
}

/** The task page's accept confirmation (`SafetyConfirmDialog` with a time to pick). */
function AcceptDialog({
  state,
  quote,
  copy,
  layout,
}: {
  state: Dialog
  quote: HeroStageQuote | undefined
  copy: HeroStageCopy
  layout: Layout
}) {
  const { ui } = copy
  return (
    <div className="sh-modal" data-open={state !== 'closed' || undefined}>
      <span className="sh-modal__scrim" />
      <div className="sh-dialog" data-layout={layout}>
        <div className="sh-dialog__head">
          <span className="sh-dialog__title">{ui.acceptTitle}</span>
          {layout === 'wide' ? (
            <span className="sh-dialog__close" aria-hidden="true">
              <LuX size={16} />
            </span>
          ) : null}
        </div>
        <p className="sh-dialog__hint">{ui.acceptHint}</p>
        <span className="sh-dialog__label">{ui.pickSlot}</span>
        <span className="sh-radio">
          <span className="sh-radio__dot" />
          {quote?.slot}
        </span>
        <span
          className="sh-confirm"
          data-target="confirm-0"
          data-cursor="hand"
          data-state={state === 'busy' ? 'busy' : 'idle'}
        >
          <States
            value={state === 'busy' ? 'busy' : 'idle'}
            states={{ idle: ui.acceptQuote, busy: <Spinner size={14} /> }}
          />
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- script

/** A quote arrives: its row opens at the top of the list, then its words land. */
async function arrive(a: Act<S>, sc: 0 | 1, i: number, notify: boolean) {
  if (notify) {
    await a.set({ note: { scene: sc, i, out: false } })
    await a.wait(650)
  }
  await a.set((s) => ({ open: set2(s.open, sc, i + 1) }))
  await a.wait(380)
  await a.set((s) => ({ landed: set2(s.landed, sc, i + 1) }))
  if (notify) {
    await a.wait(1000)
    await a.set((s) => ({ note: s.note && { ...s.note, out: true } }))
    await a.wait(320)
    await a.set({ note: null })
  }
}

/** The page header's bar, by design: the quotes stop just under it. */
const APPBAR = { wide: 56, compact: 106 }

/**
 * How far a task's page scrolls to bring its quotes up under the header: the
 * quotes card's top, less the bar and a gap. The rows that arrive open at the
 * top of the list, so the newest quote and its Accept stay in view while the
 * older ones move down past the fold.
 */
function scrollToQuotes(a: Act<S>, sc: 0 | 1, layout: Layout) {
  const page = a.rect(`page-${sc}`, { layout: true })
  const quotes = a.rect(`quotes-${sc}`, { layout: true })
  return Math.max(0, Math.round(quotes.y - page.y - APPBAR[layout] - 12))
}

function script(layout: Layout) {
  const notify = layout === 'compact'
  return async (a: Act<S>) => {
    await a.wait(900)

    // The customer reads down to the quotes
    a.mark('scroll')
    await a.move('scroll-at')
    await a.wait(150)
    await a.set((s) => ({
      scrolled: set2(s.scrolled, 0, scrollToQuotes(a, 0, layout)),
    }))
    await a.wait(1000)

    // Two quotes arrive, newest on top
    a.mark('first')
    await arrive(a, 0, 0, notify)
    await a.wait(notify ? 300 : 900)
    a.mark('second')
    await arrive(a, 0, 1, notify)
    await a.wait(notify ? 300 : 700)

    // The customer accepts the best match and confirms its time
    a.mark('accept')
    await a.click({ at: 'accept-0-1', x: 0.84, y: 0.62 })
    await a.set({ dialog: 'open' })
    await a.wait(1100)
    await a.click({ at: 'confirm-0', x: 0.78, y: 0.6 })
    await a.set({ dialog: 'busy' })
    await a.wait(650)

    // Booked: the page goes back to the top, then the booking lands there, in
    // view. Never both at once: the scrolled page would empty as quotes close
    await a.set((s) => ({
      dialog: 'closed',
      scrolled: set2(s.scrolled, 0, 0),
    }))
    // The hand leaves as the page moves, not over another quote's Accept
    await a.move('rest')
    await a.wait(250)
    await a.set({ booked: true })
    a.mark('payoff')
    await a.wait(2900)

    // A second task gets its first quote: the reset, with nothing rewinding
    a.mark('scene')
    await a.set({ scene: 1 })
    await a.wait(700)
    await a.snap((s) => ({
      open: set2(s.open, 0, 0),
      landed: set2(s.landed, 0, 0),
      scrolled: set2(s.scrolled, 0, 0),
      booked: false,
      dialog: 'closed' as const,
    }))
    await a.wait(500)
    a.mark('third')
    await arrive(a, 1, 0, notify)
    await a.wait(1800)

    await a.set({ scene: 0 })
    await a.wait(700)
    await a.snap((s) => ({
      open: set2(s.open, 1, 0),
      landed: set2(s.landed, 1, 0),
    }))
    await a.wait(300)
  }
}

const wideScript = script('wide')
const compactScript = script('compact')

// ---------------------------------------------------------------- designs

/** Where the cursor waits, and where it rests to scroll: by design. */
const REST = { wide: { x: 1010, y: 520 }, compact: { x: 312, y: 520 } }
const SCROLL_AT = { wide: { x: 560, y: 470 }, compact: { x: 220, y: 470 } }

function Spots({ layout }: { layout: Layout }) {
  return (
    <>
      <span
        data-target="rest"
        style={{
          position: 'absolute',
          left: REST[layout].x,
          top: REST[layout].y,
        }}
      />
      <span
        data-target="scroll-at"
        style={{
          position: 'absolute',
          left: SCROLL_AT[layout].x,
          top: SCROLL_AT[layout].y,
        }}
      />
    </>
  )
}

export function HeroWide({ copy }: { copy: HeroStageCopy }) {
  return (
    <Stage<S>
      width={1216}
      height={600}
      initial={START}
      poster={POSTER}
      script={wideScript}
      fidelity="realistic"
      cursor={{ at: REST.wide }}
      className="sl-look sh sh-wide"
    >
      {(s) => (
        <>
          <Window url={copy.url} className="sh-window">
            <div className="sh-scenes">
              <TaskPage sc={0} s={s} copy={copy} layout="wide" />
              <TaskPage sc={1} s={s} copy={copy} layout="wide" />
            </div>
          </Window>
          <Spots layout="wide" />
        </>
      )}
    </Stage>
  )
}

export function HeroCompact({ copy }: { copy: HeroStageCopy }) {
  return (
    <Stage<S>
      width={390}
      height={690}
      initial={START}
      poster={POSTER}
      script={compactScript}
      fidelity="realistic"
      cursor={{ at: REST.compact, style: 'touch' }}
      className="sl-look sh sh-compact"
    >
      {(s) => {
        const q = s.note ? copy.tasks[s.note.scene]?.pulses[s.note.i] : null
        return (
          <>
            <Phone width={326} className="sh-phone">
              <div className="sh-scenes">
                <TaskPage sc={0} s={s} copy={copy} layout="compact" />
                <TaskPage sc={1} s={s} copy={copy} layout="compact" />
              </div>
              {q ? (
                <Notification
                  banner
                  className="sh-banner"
                  data-out={s.note?.out || undefined}
                  icon={<img className="sh-appicon" src={MARK_SRC} alt="" />}
                  title={fill(copy.sentQuote, { name: q.name })}
                  body={`£${q.price} · ${q.note}`}
                  time=""
                />
              ) : null}
            </Phone>
            <Spots layout="compact" />
          </>
        )
      }}
    </Stage>
  )
}

/**
 * The hero scene: both designs, of which the stylesheet shows one by the
 * page's width. It is a picture of the product, so a screen reader gets one
 * label for it and none of its rows.
 */
export function HeroStage({ copy }: { copy: HeroStageCopy }) {
  return (
    <div className="sh-hosts" role="img" aria-label={copy.label}>
      <div className="sh-host sh-host--wide">
        <HeroWide copy={copy} />
      </div>
      <div className="sh-host sh-host--compact">
        <HeroCompact copy={copy} />
      </div>
    </div>
  )
}
