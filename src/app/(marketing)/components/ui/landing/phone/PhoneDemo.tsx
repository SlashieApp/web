'use client'

import type { BoxProps } from '@chakra-ui/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { formatMessage } from '@/i18n/loadPageI11n'

import { type StoryStage, useStoryStage } from '../story/storyState'
import { CUSTOMER_STAGES, WORKER_STAGES } from '../story/storySteps'
import { PhoneCrop, PhoneFrame } from './PhoneFrame'
import type { PhoneCopy, StoryCopy } from './phoneCopy'
import { ChatScreen } from './screens/ChatScreen'
import { HireScreen } from './screens/HireScreen'
import { PostScreen } from './screens/PostScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { QuotesScreen } from './screens/QuotesScreen'
import { ReviewScreen } from './screens/ReviewScreen'
import { SearchScreen } from './screens/SearchScreen'
import { WorkerQuoteScreen } from './screens/WorkerQuoteScreen'

type ScreenProps = {
  copy: PhoneCopy
  active: boolean
  intro?: boolean
  /** The cropped phone's layout: the screen's action and words in its top 274px. */
  compact?: boolean
}

const STEP_STAGES = [...CUSTOMER_STAGES, ...WORKER_STAGES]

/** The stages the phone has a screen for: the hero's, then one per step. */
const STORY_SCREENS: readonly StoryStage[] = ['hero', ...STEP_STAGES]

/**
 * The name of a phone showing `stage`: the demo, then the step it is on (as
 * the section index names it). The hero's screen is no step: the plain name.
 */
export function phoneLabel(
  copy: PhoneCopy,
  index: StoryCopy['index'],
  stage: StoryStage,
): string {
  const step = STEP_STAGES.find((id) => id === stage)
  return step
    ? formatMessage(copy.demoStepLabel, { step: index[step] })
    : copy.demoLabel
}

/** The phone screen for each story stage (after the story: the last one). */
export function PhoneScreen({
  stage,
  ...props
}: ScreenProps & { stage: StoryStage }) {
  switch (stage) {
    case 'hero':
      return <SearchScreen variant="customer" {...props} />
    case 'post':
      return <PostScreen {...props} />
    case 'quotes':
      return <QuotesScreen {...props} />
    case 'hire':
      return <HireScreen {...props} />
    case 'chat':
      return <ChatScreen {...props} />
    case 'review':
      return <ReviewScreen {...props} />
    case 'workerFind':
      return <SearchScreen variant="worker" {...props} />
    case 'workerQuote':
      return <WorkerQuoteScreen {...props} />
    default:
      return <ProfileScreen {...props} />
  }
}

const noopSubscribe = () => () => {}

/** False while rendering on the server and hydrating; true afterwards. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
}

/** Width of the pinned desktop phone: up to 300px, shorter on short screens. */
export const STICKY_PHONE_W = 'min(300px, calc((100vh - 150px) / 2.1))'

/**
 * Desktop: one phone that follows the scroll story, crossfading to each
 * stage's screen. Screens that arrive after first paint play their intro.
 * Its name follows the step it shows.
 */
export function StickyPhone({
  copy,
  index,
}: {
  copy: PhoneCopy
  index: StoryCopy['index']
}) {
  const stage = useStoryStage()
  const screen = STORY_SCREENS.includes(stage) ? stage : 'workerProfile'
  const hydrated = useHydrated()
  const reduced = useReducedMotion()

  return (
    <PhoneFrame
      label={phoneLabel(copy, index, screen)}
      nominalWidth={300}
      w={STICKY_PHONE_W}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={screen}
          style={{ position: 'absolute', inset: 0 }}
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -28 }}
          transition={{ duration: reduced ? 0 : 0.36, ease: [0.2, 0, 0, 1] }}
        >
          <PhoneScreen stage={screen} copy={copy} active intro={hydrated} />
        </motion.div>
      </AnimatePresence>
    </PhoneFrame>
  )
}

/**
 * Below `lg`: a phone per step, in the flow, cropped to its top in a well and
 * named by its step. It starts playing once a third of it is on screen and
 * only resets when it has left the screen entirely, so a half-visible phone
 * never sits empty.
 */
export function StepPhone({
  stage,
  copy,
  label,
  ...boxProps
}: BoxProps & { stage: StoryStage; copy: PhoneCopy; label: string }) {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (!entry.isIntersecting) setActive(false)
        else if (entry.intersectionRatio >= 0.33) setActive(true)
      },
      { threshold: [0, 0.33] },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <PhoneCrop ref={ref} label={label} {...boxProps}>
      <PhoneScreen
        stage={stage}
        copy={copy}
        active={active}
        intro={false}
        compact
      />
    </PhoneCrop>
  )
}
