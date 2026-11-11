'use client'

import { Box, Grid, HStack, Heading, List, Stack, Text } from '@chakra-ui/react'
import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import type { IconType } from 'react-icons'
import { LuPointer } from 'react-icons/lu'

import { SectionHead } from '@/app/(marketing)/components/layout/MarketingFrame'
import { BREAKPOINT_PX } from '@/theme/breakpoints'

import { DockedPhone, phoneLabel } from '../phone/PhoneDemo'
import { PHONE_CROP_H, PHONE_DOCK_EXTRA } from '../phone/PhoneFrame'
import type { PhoneCopy, StoryCopy } from '../phone/phoneCopy'
import { STORY_HEADER_H, STORY_INDEX_BAR_H } from './storyLayout'
import {
  RAIL_GAP_PX,
  RAIL_PEEK_PX,
  RAIL_STEP_LVH,
  railAnchor,
  railIndex,
  railPosition,
  railTravel,
} from './storyRail'
import { type StoryStage, setRailOnScreen, setStoryStage } from './storyState'
import { stepDomId } from './storySteps'

/**
 * The sideways story runs on phones (below `md`), unless the visitor asks for
 * reduced motion: then, as on a tablet, each step keeps its own phone in one
 * column (`LandingStory`). A tablet's screen is too wide for one card and too
 * tall for one phone: the rail left a band of white between them.
 */
const RAIL_WIDTH_QUERY = `(max-width: ${BREAKPOINT_PX.md - 1}px)`
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function subscribeRail(onChange: () => void) {
  const queries = [RAIL_WIDTH_QUERY, REDUCED_MOTION_QUERY].map((query) =>
    window.matchMedia(query),
  )
  for (const query of queries) query.addEventListener('change', onChange)
  return () => {
    for (const query of queries) query.removeEventListener('change', onChange)
  }
}

const railSnapshot = () =>
  window.matchMedia(RAIL_WIDTH_QUERY).matches &&
  !window.matchMedia(REDUCED_MOTION_QUERY).matches

/**
 * Whether the acts play sideways. False on the server and while hydrating, so
 * the first paint is the one-column story; on a phone the switch happens far
 * below the fold, before the visitor reaches it.
 */
export function useStoryRail(): boolean {
  return useSyncExternalStore(subscribeRail, railSnapshot, () => false)
}

/** Where the act pins: under the header and the index row (a phone's). */
const RAIL_TOP = `calc(${STORY_HEADER_H.base} + ${STORY_INDEX_BAR_H})`

/**
 * The pinned frame runs to the screen's foot. `lvh` is the screen with the
 * browser's bars put away, so the phone always reaches the foot (with the bars
 * out, they cover its cropped end) and the frame never jumps as they move.
 */
const FRAME_H = `calc(100lvh - ${RAIL_TOP})`

/** The docked phone fades out over the room it has under its screen's action. */
const PHONE_FOOT_FADE_MASK = `linear-gradient(to bottom, #000 calc(100% - ${PHONE_DOCK_EXTRA}px), transparent)`
const PHONE_FOOT_FADE = {
  maskImage: PHONE_FOOT_FADE_MASK,
  WebkitMaskImage: PHONE_FOOT_FADE_MASK,
} as const

/** The page's `scroll-padding-top` (`globals.css`), which a link lands under. */
const PAGE_SCROLL_PADDING = '80px'

type RailStep = { stage: StoryStage; copy: { title: string; body: string } }

/**
 * One step as a card on the rail: its number in Geist Mono 12, the title at
 * 18/500 and the body at 14 in `text.muted`, as the one-column rows have them.
 * The card in place is whole; the others wait at half strength.
 */
function RailCard({
  number,
  step,
  hint,
  current,
}: {
  number: number
  step: RailStep['copy']
  hint?: string
  current: boolean
}) {
  return (
    <List.Item
      flex={`0 0 calc(100% - ${RAIL_PEEK_PX}px)`}
      minW={0}
      p={5}
      bg="bg.surface"
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="xl"
      opacity={current ? 1 : 0.45}
      transition="opacity 0.3s ease"
      aria-current={current ? 'step' : undefined}
    >
      <Grid templateColumns="2.5rem minmax(0, 1fr)" alignItems="baseline">
        <Text
          as="span"
          aria-hidden
          fontFamily="mono"
          fontSize="12px"
          lineHeight="16px"
          fontWeight={500}
          fontVariantNumeric="tabular-nums"
          color="text.subtle"
        >
          {String(number).padStart(2, '0')}
        </Text>
        <Stack gap={1.5}>
          <Heading as="h3" textStyle="heading-sm" color="text.default">
            {step.title}
          </Heading>
          <Text textStyle="text-sm" color="text.muted">
            {step.body}
          </Text>
          {hint ? (
            <HStack gap={2} mt={2} textStyle="text-sm" fontWeight={500}>
              <Box as="span" display="inline-flex" color="accent.active">
                <LuPointer size={16} aria-hidden />
              </Box>
              <Text color="text.muted">{hint}</Text>
            </HStack>
          ) : null}
        </Stack>
      </Grid>
    </List.Item>
  )
}

/**
 * An act on a phone (FE-542, Ryan's review of push 1): the act's head over
 * its steps as cards in a row, and the demo phone docked at the screen's foot.
 * The act pins under the index row while the visitor scrolls down through it;
 * the scroll carries the cards sideways, each holding still in place for a
 * while (`storyRail.ts`), and the phone shows the step whose card is in place.
 * The section index and the story's stage follow that step too.
 *
 * Each step keeps a link target (`stepDomId`): an empty block placed where
 * that step's card holds in place, so the index row still lands on the step.
 */
export function StoryRail({
  icon,
  eyebrow,
  heading,
  steps,
  phone,
  index,
  hint,
  spaced = false,
}: {
  icon: IconType
  eyebrow: string
  heading: string
  steps: RailStep[]
  phone: PhoneCopy
  index: StoryCopy['index']
  hint?: string
  spaced?: boolean
}) {
  const sectionRef = useRef<HTMLElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLOListElement>(null)
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [onScreen, setOnScreen] = useState(false)
  const count = steps.length
  const stages = steps.map((step) => step.stage)
  const stagesKey = stages.join(' ')

  // The scroll drives the track: one CSS variable, written each frame, so
  // React only renders when the step in place changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `stagesKey` stands for `stages`.
  useEffect(() => {
    const section = sectionRef.current
    const frame = frameRef.current
    const track = trackRef.current
    if (!section || !frame || !track) return
    let frameId = 0
    let shown = -1
    const update = () => {
      frameId = 0
      const box = section.getBoundingClientRect()
      const pinTop = Number.parseFloat(getComputedStyle(frame).top) || 0
      const travel = section.offsetHeight - frame.offsetHeight
      const raw =
        travel > 0 ? ((pinTop - box.top) / travel) * railTravel(count) : 0
      const position = railPosition(raw, count)
      track.style.setProperty('--rail-position', position.toFixed(4))
      const step = railIndex(position, count)
      if (step !== shown) {
        if (shown !== -1) setDirection(step > shown ? 1 : -1)
        shown = step
        setCurrent(step)
      }
      // While the act is across the middle of the screen it is the story's
      // stage: the index row and anything else that follows the story.
      const middle = window.innerHeight / 2
      const stage = stages[step]
      if (stage && box.top <= middle && box.bottom >= middle) {
        setStoryStage(stage)
      }
    }
    const onScroll = () => {
      if (!frameId) frameId = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frameId) cancelAnimationFrame(frameId)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [count, stagesKey])

  // The phone plays only while the act is on screen, and the floating Post a
  // task pill steps aside for it (it sits where the phone is docked).
  const railId = useId()
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const observer = new IntersectionObserver(([entry]) => {
      const visible = Boolean(entry?.isIntersecting)
      setOnScreen(visible)
      setRailOnScreen(railId, visible)
    })
    observer.observe(section)
    return () => {
      observer.disconnect()
      setRailOnScreen(railId, false)
    }
  }, [railId])

  const [first] = steps
  const headingId = `${first?.stage}-heading`
  const shownStage = stages[current] ?? first?.stage ?? 'post'
  const travel = railTravel(count)
  return (
    <Box
      as="section"
      ref={sectionRef}
      aria-labelledby={headingId}
      data-story-rail=""
      position="relative"
      mt={spaced ? 14 : 0}
      h={`calc(${FRAME_H} + ${travel} * ${RAIL_STEP_LVH}lvh)`}
    >
      {/* Link targets: where each step's card holds in place. A link lands
          `scroll-padding-top` above its target, so each sits that far below
          the scroll that shows its step. */}
      {steps.map(({ stage }, position) => (
        <Box
          key={stage}
          id={stepDomId(stage)}
          position="absolute"
          left={0}
          w="1px"
          h="1px"
          pointerEvents="none"
          top={`calc(${railAnchor(position)} * ${RAIL_STEP_LVH}lvh - ${RAIL_TOP} + ${PAGE_SCROLL_PADDING})`}
        />
      ))}
      <Box
        ref={frameRef}
        position="sticky"
        top={RAIL_TOP}
        h={FRAME_H}
        display="flex"
        flexDirection="column"
        pt={6}
        // A short screen crops the docked phone, never the cards above it.
        overflow="hidden"
      >
        <SectionHead
          icon={icon}
          eyebrow={eyebrow}
          heading={heading}
          headingId={headingId}
        />
        {/* The cards run from screen edge to screen edge: the row takes back
            the page's gutters and pads them in again. */}
        <Box mt={6} mx={-4} px={4} overflow="hidden" flexShrink={0}>
          <List.Root
            as="ol"
            ref={trackRef}
            m={0}
            p={0}
            listStyleType="none"
            // The list's own recipe is a column: the rail is one row.
            display="flex"
            flexDirection="row"
            flexWrap="nowrap"
            alignItems="stretch"
            gap={`${RAIL_GAP_PX}px`}
            // Each card is the row's width less the peek; the track moves one
            // card and one gap per step.
            transform={`translate3d(calc(var(--rail-position, 0) * (${RAIL_PEEK_PX - RAIL_GAP_PX}px - 100%)), 0, 0)`}
            willChange="transform"
          >
            {steps.map(({ stage, copy }, position) => (
              <RailCard
                key={stage}
                number={position + 1}
                step={copy}
                hint={position === 0 ? hint : undefined}
                current={position === current}
              />
            ))}
          </List.Root>
        </Box>
        <Box flex={1} minH={4} />
        <DockedPhone
          stage={shownStage}
          direction={direction}
          copy={phone}
          label={phoneLabel(phone, index, shownStage)}
          active={onScreen}
          h={`${PHONE_CROP_H + PHONE_DOCK_EXTRA}px`}
          flexShrink={1}
          // On the shortest screens the phone keeps its top and runs off.
          minH="160px"
          mx={-4}
          // The phone fades out at its cropped foot, which then never reads
          // as a cut, at the screen's edge or as the act scrolls away.
          style={PHONE_FOOT_FADE}
        />
      </Box>
    </Box>
  )
}
