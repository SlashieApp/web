'use client'

import { Box, Grid, Heading, Stack, Text } from '@chakra-ui/react'
import { type ReactNode, useLayoutEffect, useRef, useState } from 'react'
import { LuCalendar, LuMapPin, LuStar } from 'react-icons/lu'

import {
  type Act,
  Avatar,
  Stage,
  States,
} from '@/app/(marketing)/components/stage'
import { PAGE_GUTTER_X } from '@/theme/pageContainer'
import { PageBleed } from '@/ui/PageContainer'

import { Reveal } from '../Reveal'
import { Done } from '../stage/Done'
import '../stage/stageLook.css'
import './customerTiles.css'

// The customer's five steps as one picture made of tiles (FE-542), planned
// with the Stageshow skill's rules for a grid:
//
//   Tile     Span   Kind        The one thing                 Its beat
//   post     2 x 1  Hero UI     the post form, one component  Post task settles to Posted
//   quotes   1 x 1  Collection  price chips, one picked       the chips arrive in turn
//   hire     1 x 1  Stat        0%, Slashie's cut             (type: it holds still)
//   chat     1 x 1  Component   two messages                  the reply arrives
//   review   1 x 1  Component   five stars                    the stars fill
//
// No window chrome (the hero scene above has the page's one window). Every
// neighbour is a different kind, across and down. Each picture is its own
// stage at 1:1, as wide as its tile; the copy is page text above it. Each
// plays one beat, once, as it scrolls in, 110ms after the tile before it.

type StepCopy = { title: string; body: string }

/** The five customer steps (`landing.story.customer.steps`), in order. */
export type CustomerTilesSteps = Record<TileKey, StepCopy>

export type CustomerTilesCopy = {
  post: {
    what: string
    value: string
    where: string
    whereValue: string
    when: string
    whenValue: string
    budget: string
    budgetValue: string
    submit: string
    posted: string
  }
  /** Quotes on one task, as prices. The fourth is the one picked (the lowest). */
  quotes: { prices: readonly string[] }
  /** Slashie's cut of the job: a real figure, never filler. */
  hire: { figure: string; label: string }
  chat: { theirs: string; mine: string }
  review: { prompt: string }
}

type TileKey = 'post' | 'quotes' | 'hire' | 'chat' | 'review'

/** The tiles, in reading order (the order of the steps). */
export const CUSTOMER_TILE_KEYS: readonly TileKey[] = [
  'post',
  'quotes',
  'hire',
  'chat',
  'review',
]

/** A tile's heading id: it names the tile and, together, the section. */
export const customerTileTitleId = (key: TileKey) => `customer-tile-${key}`

// ------------------------------------------------------------------ beats

type Beat = { on: boolean }
const BEFORE: Beat = { on: false }
const AFTER: Beat = { on: true }

/** How long a tile waits once it is in view, and the step between tiles. */
const LEAD_MS = 450
const STEP_MS = 110

const beat = (index: number) => async (a: Act<Beat>) => {
  await a.wait(LEAD_MS + index * STEP_MS)
  await a.set({ on: true })
}

/**
 * A picture's width before it is measured (the server's render): its slot's
 * width on a desktop. From 1280px the grid is the page's 1280px column: three
 * 426px columns and two hairlines, less a tile's 32px gutters, so 362px for
 * one column and 789px for the form's two. A desktop page therefore loads
 * with its pictures already the right width; a narrower one re-lays them out
 * once, when it hydrates, below the fold.
 */
const SLOT_PX = { one: 362, two: 789 } as const

/**
 * The tile owns the crop: its picture's stage is as wide as the tile's
 * picture slot, so the stage is never scaled (its text stays its own size)
 * and never cuts its content before the tile's edge.
 */
function usePictureWidth(initial: number) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(initial)
  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    const measure = () =>
      setWidth(Math.max(1, Math.round(node.getBoundingClientRect().width)))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return [ref, width] as const
}

/** A picture: one stage, as wide as its slot, that plays its beat once. */
function Picture({
  index,
  height,
  initialWidth = SLOT_PX.one,
  children,
}: {
  index: number
  /** The stage's height, from its width (a narrow form stacks its fields). */
  height: number | ((width: number) => number)
  initialWidth?: number
  children: (on: boolean, width: number) => ReactNode
}) {
  const [slot, width] = usePictureWidth(initialWidth)
  return (
    // The pictures illustrate the copy above them: decoration to a screen
    // reader, which has the title and the body.
    <div ref={slot} className="ct-picture" aria-hidden="true">
      <Stage<Beat>
        width={width}
        height={typeof height === 'function' ? height(width) : height}
        initial={BEFORE}
        poster={AFTER}
        play="once"
        script={beat(index)}
        className="sl-look ct"
      >
        {(s) => children(s.on, width)}
      </Stage>
    </div>
  )
}

// --------------------------------------------------------------- pictures

/** Below this width the post form stacks its three small fields. */
const FORM_NARROW_PX = 480

/** Post: the form, one component, filled in. The button settles to Posted. */
function PostPicture({ copy }: { copy: CustomerTilesCopy['post'] }) {
  return (
    <Picture
      index={0}
      initialWidth={SLOT_PX.two}
      // The form's own height, to the pixel: its foot is the stage's.
      height={(width) => (width < FORM_NARROW_PX ? 290 : 218)}
    >
      {(on, width) => (
        <div
          className="ct-form"
          data-on={on || undefined}
          data-narrow={width < FORM_NARROW_PX || undefined}
        >
          <div className="ct-field ct-field--what">
            <span className="ct-label">{copy.what}</span>
            <span className="ct-value">{copy.value}</span>
          </div>
          <div className="ct-fields">
            <div className="ct-field ct-field--where">
              <span className="ct-label">{copy.where}</span>
              <span className="ct-value">
                <LuMapPin className="ct-glyph" size={14} aria-hidden="true" />
                {copy.whereValue}
              </span>
            </div>
            <div className="ct-field">
              <span className="ct-label">{copy.when}</span>
              <span className="ct-value">
                <LuCalendar className="ct-glyph" size={14} aria-hidden="true" />
                {copy.whenValue}
              </span>
            </div>
            <div className="ct-field">
              <span className="ct-label">{copy.budget}</span>
              <span className="ct-value">{copy.budgetValue}</span>
            </div>
          </div>
          <div className="ct-submit" data-state={on ? 'done' : 'idle'}>
            <States
              value={on ? 'done' : 'idle'}
              states={{
                idle: copy.submit,
                done: <Done label={copy.posted} className="ct-done" />,
              }}
            />
          </div>
        </div>
      )}
    </Picture>
  )
}

/** Names only pick each chip's avatar: its colour and its initial. */
const CHIP_PEOPLE = [
  'Mia',
  'Theo',
  'Ravi',
  'Kai',
  'Lena',
  'Noor',
  'Dara',
  'Finn',
  'Ola',
]

/** The chip the customer picks: the fourth, the lowest price (the middle row's first). */
const PICKED_CHIP = 3

/** Chips sit three to a row, 116px apart, the middle row set in by half a chip. */
const CHIPS_PER_ROW = 3
const CHIP_PITCH_PX = 116
const CHIP_WIDTH_PX = 96
const CHIP_ROW_PX = 62

const chipSpot = (index: number) => {
  const row = Math.floor(index / CHIPS_PER_ROW)
  const inset = row % 2 === 1 ? CHIP_PITCH_PX / 2 : 0
  return {
    left: (index % CHIPS_PER_ROW) * CHIP_PITCH_PX + inset,
    top: 6 + row * CHIP_ROW_PX,
  }
}

/**
 * The chips a picture `width` wide shows: only those that fit whole. A price
 * is real text, and real text is never cut by an edge, so a narrow tile shows
 * fewer chips, not sliced ones.
 */
export function chipsThatFit<T>(chips: readonly T[], width: number): T[] {
  return chips.filter(
    (_, index) => chipSpot(index).left + CHIP_WIDTH_PX <= width,
  )
}

/** Quotes: a collection of prices, one of them picked. The chips arrive in turn. */
function QuotesPicture({ copy }: { copy: CustomerTilesCopy['quotes'] }) {
  const chips = copy.prices
    .slice(0, CHIP_PEOPLE.length)
    .map((price, index) => ({ price, index }))
  return (
    <Picture index={1} height={186}>
      {(on, width) => (
        <div className="ct-chips" data-on={on || undefined}>
          {chipsThatFit(chips, width).map(({ price, index }, order) => (
            <span
              key={`${CHIP_PEOPLE[index]}-${price}`}
              className="ct-chip"
              data-pick={index === PICKED_CHIP || undefined}
              style={{
                ...chipSpot(index),
                transitionDelay: `${order * 60}ms`,
              }}
            >
              <Avatar name={CHIP_PEOPLE[index] ?? ''} size={28} />
              <span className="ct-price">{price}</span>
            </span>
          ))}
        </div>
      )}
    </Picture>
  )
}

/** Chat: two messages in the product's own bubbles. The reply arrives. */
function ChatPicture({ copy }: { copy: CustomerTilesCopy['chat'] }) {
  return (
    <Picture index={3} height={116}>
      {(on) => (
        <div className="ct-chat" data-on={on || undefined}>
          <span className="ct-bubble ct-bubble--theirs">{copy.theirs}</span>
          <span className="ct-bubble ct-bubble--mine">{copy.mine}</span>
        </div>
      )}
    </Picture>
  )
}

/** Review: the rating, five stars at twice their size. They fill in turn. */
function ReviewPicture({ copy }: { copy: CustomerTilesCopy['review'] }) {
  return (
    <Picture index={4} height={72}>
      {(on) => (
        <div className="ct-review" data-on={on || undefined}>
          <span className="ct-prompt">{copy.prompt}</span>
          <span className="ct-stars">
            {[0, 1, 2, 3, 4].map((star) => (
              <LuStar
                key={star}
                className="ct-star"
                size={36}
                style={{ transitionDelay: `${star * 90}ms` }}
                aria-hidden="true"
              />
            ))}
          </span>
        </div>
      )}
    </Picture>
  )
}

/** Hire: a stat, which is type, not a picture. One real number. */
function HireFigure({ copy }: { copy: CustomerTilesCopy['hire'] }) {
  return (
    <Stack gap={1} data-customer-figure="">
      <Text
        as="span"
        fontSize={{ base: '56px', lg: '64px' }}
        lineHeight={1}
        fontWeight={500}
        letterSpacing="-0.045em"
        fontVariantNumeric="tabular-nums"
        color="text.default"
        whiteSpace="nowrap"
      >
        {copy.figure}
      </Text>
      <Text as="span" textStyle="text-sm" color="text.muted">
        {copy.label}
      </Text>
    </Stack>
  )
}

// -------------------------------------------------------------------- grid

/** Where each tile sits: one column, then two, then the hero and its strip. */
const TILE_AREAS = {
  base: `"post" "quotes" "hire" "chat" "review"`,
  md: `"post post" "quotes hire" "chat review"`,
  lg: `"post post quotes" "hire chat review"`,
} as const

/** A tile's padding above its copy: 32px, 40 from `lg`. */
export const CUSTOMER_TILE_PT = { base: 8, lg: 10 } as const

function pictureFor(key: TileKey, copy: CustomerTilesCopy): ReactNode {
  switch (key) {
    case 'post':
      return <PostPicture copy={copy.post} />
    case 'quotes':
      return <QuotesPicture copy={copy.quotes} />
    case 'hire':
      return <HireFigure copy={copy.hire} />
    case 'chat':
      return <ChatPicture copy={copy.chat} />
    case 'review':
      return <ReviewPicture copy={copy.review} />
  }
}

/**
 * The customer's five steps as a ruled grid of tiles (FE-542, push 2): post,
 * quotes, hire, chat, review, each a title and a body (today's strings) over
 * one small picture of the product. It replaces the three boxed cells.
 *
 * From `lg` it is a hero and a strip: the post form over two columns beside
 * the quotes, then the figure, the messages and the stars. From `md` two
 * columns (the form across both); on a phone the tiles stack in the steps'
 * order. The tiles are divided by hairlines, between the frame's rails and
 * rules: the grid's 1px gaps show its `border.default` ground.
 *
 * The section has no heading of its own: each tile's title is an h2 and the
 * section landmark is named by the five of them.
 */
export function CustomerTiles({
  steps,
  copy,
}: {
  steps: CustomerTilesSteps
  copy: CustomerTilesCopy
}) {
  return (
    <PageBleed
      as="section"
      aria-labelledby={CUSTOMER_TILE_KEYS.map(customerTileTitleId).join(' ')}
      data-customer-tiles=""
      gutters="none"
    >
      <Grid
        gap="1px"
        bg="border.default"
        templateAreas={TILE_AREAS}
        templateColumns={{
          base: 'minmax(0, 1fr)',
          md: 'repeat(2, minmax(0, 1fr))',
          lg: 'repeat(3, minmax(0, 1fr))',
        }}
      >
        {CUSTOMER_TILE_KEYS.map((key, index) => (
          <Box
            key={key}
            gridArea={key}
            data-customer-tile={key}
            // The tile owns the crop: a picture may run off its edge.
            data-crop=""
            display="flex"
            flexDirection="column"
            gap={{ base: 6, lg: 8 }}
            minW={0}
            overflow="hidden"
            bg="bg.surface"
            px={PAGE_GUTTER_X}
            pt={CUSTOMER_TILE_PT}
            // Under its picture a tile keeps the gutter it has beside it, so
            // a card that fills the tile has one gutter on three sides.
            pb={PAGE_GUTTER_X}
          >
            <Reveal delayMs={index * 70}>
              <Stack gap={2} maxW="34rem">
                <Heading
                  as="h2"
                  id={customerTileTitleId(key)}
                  textStyle="heading-md"
                  textWrap="balance"
                >
                  {steps[key].title}
                </Heading>
                <Text textStyle="text-md" color="text.muted">
                  {steps[key].body}
                </Text>
              </Stack>
            </Reveal>
            {pictureFor(key, copy)}
          </Box>
        ))}
      </Grid>
    </PageBleed>
  )
}
