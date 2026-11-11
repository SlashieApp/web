'use client'

import { LuStar } from 'react-icons/lu'

import {
  type Act,
  Avatar,
  Badge,
  Bar,
  Button,
  Collapse,
  Count,
  Fly,
  Notification,
  Phone,
  type Rect,
  Roll,
  Spinner,
  Stage,
  States,
  Window,
} from '@/app/(marketing)/components/stage'

import { Done } from './Done'
import { StageMap } from './StageMap'
import './stageLook.css'
import './heroStage.css'

/** Slashie's mark, the app icon on a notification. */
const MARK_SRC = '/images/slashie-mark.svg'

// The landing's hero scene, built on the Stageshow kit, in two designs that tell one story: quotes arrive on a task
// and the customer accepts one.
//
// Wide (a desktop column): a system story with one gesture. Workers nearby send
// quotes from their side (the card), each price rides into the customer's task
// page as a new row, and the customer accepts one. The card and the window are
// the two sides of the marketplace; the price chip is the only thing that
// travels between them.
//
// Compact (a phone column): the same task in the app. Each quote is announced
// by a notification, opens as a row, and a tap accepts it.
//
// In both, a second task plays one arrival, which is also how the loop resets
// without rewinding.

export type HeroStageQuote = {
  name: string
  rating: string
  jobs: string
  note: string
  price: number
}
export type HeroStageTask = {
  title: string
  area: string
  when: string
  kind: string
  budget: number
  /** Quotes that were already there. */
  base: HeroStageQuote[]
  /** Quotes that arrive, oldest first. */
  pulses: HeroStageQuote[]
}

export type HeroStageCopy = {
  /** What the picture shows, for a screen reader. */
  label: string
  url: string
  open: string
  booked: string
  quotes: string
  accept: string
  accepted: string
  send: string
  sent: string
  /** The worker's side once the customer accepts. */
  acceptedFor: string
  forTask: string
  /** A notification's title; `{name}` is the worker. */
  sentQuote: string
  /** Two tasks: the one that gets booked, then the one that resets the loop. */
  tasks: readonly HeroStageTask[]
}

/** Where each task's area sits on its map, as fractions: [wide, compact]. */
const AREAS: [[number, number], [number, number]][] = [
  [
    [0.69, 0.27],
    [0.7, 0.72],
  ],
  [
    [0.7, 0.37],
    [0.62, 0.72],
  ],
]

const set2 = <T,>(pair: [T, T], i: number, v: T): [T, T] =>
  i === 0 ? [v, pair[1]] : [pair[0], v]

const Star = () => <LuStar className="sh-star" size={12} aria-hidden="true" />

// ---------------------------------------------------------------- shared parts

function QuoteRow({
  q,
  id,
  landed,
  booked,
  dim,
  copy,
}: {
  q: HeroStageQuote
  id?: string
  landed: boolean
  booked?: boolean
  dim?: boolean
  copy: HeroStageCopy
}) {
  return (
    <div
      className="sh-row"
      data-target={id && `row-${id}`}
      data-landed={landed || undefined}
      data-dim={dim || undefined}
    >
      <Avatar name={q.name} size={32} className="sh-av" />
      <span className="sh-who">
        <span className="sh-line">
          <span className="sh-name">{q.name}</span>
          <span className="sh-rating">
            <Star />
            {q.rating} ({q.jobs})
          </span>
        </span>
        <span className="sh-note">{q.note}</span>
      </span>
      <span className="sh-price" data-target={id && `price-${id}`}>
        £{q.price}
      </span>
      {/* One slot for both labels: the button keeps the longer one's width, so the price beside it never moves */}
      <span className="sh-act">
        <Button
          className="sh-accept"
          size="medium"
          variant={booked ? 'primary' : 'secondary'}
          data-target={id && `accept-${id}`}
          data-cursor="hand"
        >
          <States
            value={booked ? 'done' : 'idle'}
            states={{
              idle: copy.accept,
              done: <Done label={copy.accepted} />,
            }}
          />
        </Button>
      </span>
    </div>
  )
}

type Lists = {
  scene: number
  open: [number, number]
  landed: [number, number]
  booked: boolean
}

function TaskPage({
  sc,
  s,
  copy,
  compact,
}: { sc: number; s: Lists; copy: HeroStageCopy; compact?: boolean }) {
  const t = copy.tasks[sc]
  const booked = sc === 0 && s.booked
  const top = t.pulses.length - 1
  const at = AREAS[sc][compact ? 1 : 0]
  const spot = { left: `${at[0] * 100}%`, top: `${at[1] * 100}%` }
  return (
    <div
      className="sh-scene"
      data-on={s.scene === sc || undefined}
      aria-hidden={s.scene !== sc || undefined}
    >
      <div className="sh-map">
        <StageMap phone={compact} />
        <span className="sh-area" style={spot}>
          <span className="sh-pin">£{t.budget}</span>
        </span>
        <span className="sh-place" style={spot}>
          {t.area}
        </span>
      </div>
      <div className="sh-main">
        <div className="sh-head">
          <div className="sh-title">{t.title}</div>
          <div className="sh-facts">
            <Badge tone="success" dot className="sh-status">
              <Roll>{booked ? copy.booked : copy.open}</Roll>
            </Badge>
            <span className="sh-fact">{t.area}</span>
            <span className="sh-fact">{t.when}</span>
            <span className="sh-fact">{t.kind}</span>
          </div>
        </div>
        <div className="sh-quotes">
          <span className="sh-label">{copy.quotes}</span>
          <span className="sh-count">
            <Count value={t.base.length + s.landed[sc]} duration={500} />
          </span>
        </div>
        <div className="sh-list" data-target={`list-${sc}`}>
          {/* Newest first: each new quote opens at the top and pushes the rest down */}
          {t.pulses
            .map((q, i) => ({ q, i }))
            .reverse()
            .map(({ q, i }) => (
              <Collapse key={q.name} open={s.open[sc] > i} reveal="clip">
                <QuoteRow
                  q={q}
                  id={`${sc}-${i}`}
                  landed={s.landed[sc] > i}
                  booked={booked && i === top}
                  dim={booked && i !== top}
                  copy={copy}
                />
              </Collapse>
            ))}
          {t.base.map((q) => (
            <QuoteRow key={q.name} q={q} landed dim={booked} copy={copy} />
          ))}
        </div>
        {/* The rest of the page, as filler: it reads on past the quotes and
            runs off the foot whatever the number of quotes, so no state
            leaves a blank band under the list */}
        <div className="sh-more">
          <Bar w={64} h={6} tone={3} />
          {[210, 164, 188].map((w) => (
            <div key={w} className="sh-more__row">
              <Bar w={18} h={18} r={9} tone={2} />
              <Bar w={w} h={5} tone={2} />
            </div>
          ))}
        </div>
        <div className="sh-more sh-more--text">
          <Bar w={84} h={6} tone={3} />
          {(compact ? [300, 270, 200] : [420, 380, 300]).map((w) => (
            <Bar key={w} w={w} h={5} tone={2} />
          ))}
        </div>
        <div className="sh-more sh-more--text">
          <Bar w={56} h={6} tone={3} />
          {(compact ? [250, 170] : [360, 250]).map((w) => (
            <Bar key={w} w={w} h={5} tone={2} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- wide

type Pay = 'idle' | 'busy' | 'paid' | 'done' | 'booked'
type W = Lists & {
  // per task: which worker the card shows, and its button
  k: [number, number]
  pay: [Pay, Pay]
  fly: null | { scene: number; i: number; from: Rect; to: Rect; go: boolean }
}

const W_START: W = {
  scene: 0,
  open: [0, 0],
  landed: [0, 0],
  k: [0, 0],
  pay: ['idle', 'idle'],
  booked: false,
  fly: null,
}
const W_POSTER: W = {
  ...W_START,
  open: [2, 0],
  landed: [2, 0],
  k: [1, 0],
  pay: ['booked', 'idle'],
  booked: true,
}

/** Where the cursor waits: empty page under the quotes, near the button it will press. */
const W_REST = { x: 1004, y: 430 }

async function send(a: Act<W>, sc: number, i: number) {
  await a.set((s) => ({ pay: set2(s.pay, sc, 'busy') }))
  await a.wait(650)
  // Sent: the price lifts off the worker's button and the new row's space opens
  // at the top of the customer's list while it travels.
  const list = a.rect(`list-${sc}`, { layout: true })
  const row = a.rect(`row-${sc}-${i}`, { layout: true })
  const pill = a.rect(`price-${sc}-${i}`, { layout: true })
  const b = a.rect(`send-${sc}`, { layout: true })
  const size = { width: pill.width, height: pill.height }
  const to = { ...pill, y: list.y + pill.y - row.y }
  const from = {
    x: b.x + b.width / 2 - pill.width / 2,
    y: b.y + b.height / 2 - pill.height / 2,
    ...size,
  }
  await a.set((s) => ({
    pay: set2(s.pay, sc, 'paid'),
    fly: { scene: sc, i, from, to, go: false },
  }))
  await a.wait(200)
  await a.set((s) => ({
    open: set2(s.open, sc, i + 1),
    fly: s.fly && { ...s.fly, go: true },
  }))
  await a.wait(900)
  // Landed: the row's own price takes over in the frame the chip goes
  await a.set((s) => ({
    fly: null,
    landed: set2(s.landed, sc, i + 1),
    pay: set2(s.pay, sc, 'done'),
  }))
}

async function wideScript(a: Act<W>) {
  await a.wait(700)
  a.mark('first')
  await send(a, 0, 0)
  await a.wait(550)
  // The next worker nearby: only the name and the price change
  await a.set((s) => ({ pay: set2(s.pay, 0, 'idle'), k: set2(s.k, 0, 1) }))
  await a.wait(750)
  a.mark('second')
  await send(a, 0, 1)
  await a.wait(600)

  // The customer chooses
  a.mark('accept')
  await a.click({ at: 'accept-0-1', x: 0.84, y: 0.66 })
  await a.set((s) => ({ booked: true, pay: set2(s.pay, 0, 'booked') }))
  a.mark('payoff')
  await a.wait(500)
  await a.move('rest')
  await a.wait(2000)

  a.mark('scene')
  await a.set({ scene: 1 })
  await a.wait(700)
  // The first task resets while it is out of sight
  await a.snap((s) => ({
    open: set2(s.open, 0, 0),
    landed: set2(s.landed, 0, 0),
    k: set2(s.k, 0, 0),
    pay: set2(s.pay, 0, 'idle'),
    booked: false,
  }))
  await a.wait(400)
  a.mark('third')
  await send(a, 1, 0)
  await a.wait(1600)

  await a.set({ scene: 0 })
  await a.wait(700)
  await a.snap((s) => ({
    open: set2(s.open, 1, 0),
    landed: set2(s.landed, 1, 0),
    pay: set2(s.pay, 1, 'idle'),
  }))
  await a.wait(300)
}

/** The worker's side: a quote being sent. Moves on to the next worker between arrivals. */
function WorkerCard({
  sc,
  s,
  copy,
}: { sc: number; s: W; copy: HeroStageCopy }) {
  const q = copy.tasks[sc].pulses[s.k[sc]]
  return (
    <div className="sh-card" data-in={s.scene === sc || undefined}>
      <div className="sh-card__head">
        <span className="sh-strong">
          <Roll variant="fade">{q.name}</Roll>
        </span>
        <span className="sh-rating">
          <Star />
          <Roll>{q.rating}</Roll>
        </span>
      </div>
      <div className="sh-amount">
        <Roll>{`£${q.price}`}</Roll>
        <span className="sh-muted">{copy.forTask}</span>
      </div>
      <div className="sh-fields">
        <div className="sh-field">
          <Bar w={sc === 0 ? 132 : 118} h={5} tone={3} />
        </div>
        <div className="sh-field">
          <Bar w={14} h={14} r={4} tone={2} />
          <Bar w={84} h={5} tone={3} />
        </div>
      </div>
      <div
        className="sh-send"
        data-target={`send-${sc}`}
        data-state={s.pay[sc]}
      >
        <States
          value={s.pay[sc]}
          states={{
            idle: copy.send,
            busy: <Spinner size={14} />,
            // The price is the feedback while it leaves the button
            paid: null,
            done: <Done label={copy.sent} />,
            booked: <Done label={copy.acceptedFor} />,
          }}
        />
      </div>
    </div>
  )
}

export function HeroWide({ copy }: { copy: HeroStageCopy }) {
  return (
    <Stage<W>
      width={1216}
      height={520}
      initial={W_START}
      poster={W_POSTER}
      script={wideScript}
      fidelity="realistic"
      cursor={{ at: W_REST }}
      className="sl-look sh sh-wide"
    >
      {(s) => (
        <>
          <Window url={copy.url} className="sh-window">
            <div className="sh-scenes">
              <TaskPage sc={0} s={s} copy={copy} />
              <TaskPage sc={1} s={s} copy={copy} />
            </div>
          </Window>
          <span
            data-target="rest"
            style={{ position: 'absolute', left: W_REST.x, top: W_REST.y }}
          />
          <WorkerCard sc={0} s={s} copy={copy} />
          <WorkerCard sc={1} s={s} copy={copy} />
          {s.fly && (
            <Fly
              from={s.fly.from}
              to={s.fly.to}
              go={s.fly.go}
              held
              duration={900}
            >
              <span className="sh-price sh-price--chip">
                £{copy.tasks[s.fly.scene].pulses[s.fly.i].price}
              </span>
            </Fly>
          )}
        </>
      )}
    </Stage>
  )
}

// ---------------------------------------------------------------- compact

type C = Lists & {
  /** The notification announcing a quote. */
  note: null | { scene: number; i: number; out: boolean }
}

const C_START: C = {
  scene: 0,
  open: [0, 0],
  landed: [0, 0],
  booked: false,
  note: null,
}
const C_POSTER: C = { ...C_START, open: [2, 0], landed: [2, 0], booked: true }
/** Where the finger waits: under the quotes, near the button it will tap. */
const C_REST = { x: 316, y: 470 }

async function arrive(a: Act<C>, sc: number, i: number) {
  // The quote is announced, then opens as the newest row under it
  await a.set({ note: { scene: sc, i, out: false } })
  await a.wait(750)
  await a.set((s) => ({ open: set2(s.open, sc, i + 1) }))
  await a.wait(380)
  await a.set((s) => ({ landed: set2(s.landed, sc, i + 1) }))
  await a.wait(1000)
  await a.set((s) => ({ note: s.note && { ...s.note, out: true } }))
  await a.wait(340)
  await a.set({ note: null })
}

async function compactScript(a: Act<C>) {
  await a.wait(700)
  a.mark('first')
  await arrive(a, 0, 0)
  await a.wait(350)
  a.mark('second')
  await arrive(a, 0, 1)
  await a.wait(450)

  a.mark('accept')
  await a.click({ at: 'accept-0-1', x: 0.5, y: 0.6 })
  await a.set({ booked: true })
  a.mark('payoff')
  await a.move('rest')
  await a.wait(2300)

  a.mark('scene')
  await a.set({ scene: 1 })
  await a.wait(600)
  await a.snap((s) => ({
    open: set2(s.open, 0, 0),
    landed: set2(s.landed, 0, 0),
    booked: false,
  }))
  await a.wait(300)
  a.mark('third')
  await arrive(a, 1, 0)
  await a.wait(1300)

  await a.set({ scene: 0 })
  await a.wait(600)
  await a.snap((s) => ({
    open: set2(s.open, 1, 0),
    landed: set2(s.landed, 1, 0),
  }))
  await a.wait(300)
}

export function HeroCompact({ copy }: { copy: HeroStageCopy }) {
  return (
    <Stage<C>
      // A phone screen's width: the host takes back the page gutter, so on a
      // phone the stage runs from one edge of the screen to the other.
      width={390}
      height={520}
      initial={C_START}
      poster={C_POSTER}
      script={compactScript}
      fidelity="realistic"
      cursor={{ at: C_REST, style: 'touch' }}
      className="sl-look sh sh-compact"
    >
      {(s) => {
        const q = s.note ? copy.tasks[s.note.scene].pulses[s.note.i] : null
        return (
          <>
            <Phone width={326} className="sh-phone">
              <div className="sh-scenes">
                <TaskPage sc={0} s={s} copy={copy} compact />
                <TaskPage sc={1} s={s} copy={copy} compact />
              </div>
              {q && (
                <Notification
                  banner
                  className="sh-banner"
                  data-out={s.note?.out || undefined}
                  icon={<img className="sh-appicon" src={MARK_SRC} alt="" />}
                  title={copy.sentQuote.replace('{name}', q.name)}
                  body={`£${q.price} · ${q.note}`}
                  time=""
                />
              )}
            </Phone>
            <span
              data-target="rest"
              style={{ position: 'absolute', left: C_REST.x, top: C_REST.y }}
            />
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
