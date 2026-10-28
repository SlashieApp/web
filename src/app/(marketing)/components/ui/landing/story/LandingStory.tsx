'use client'

import {
  Box,
  Container,
  Grid,
  HStack,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react'
import { motion, useMotionValue, useReducedMotion } from 'motion/react'
import { type ReactNode, useEffect, useRef } from 'react'
import { LuPointer } from 'react-icons/lu'

import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'
import { sdlEyebrow, sdlFigure } from '@/theme/styles'

import { STICKY_PHONE_W, StepPhone, StickyPhone } from '../phone/PhoneDemo'
import { PHONE_ASPECT } from '../phone/PhoneFrame'
import type { PhoneCopy, StoryCopy } from '../phone/phoneCopy'
import { HeroObjectsPoster } from '../scene/HeroObjectsPoster'
import { StoryStageMarker } from './StoryTracker'
import type { StoryStage } from './storyState'

const PHONE_H = `calc(${STICKY_PHONE_W} * ${PHONE_ASPECT})`

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
}

/**
 * Desktop phone layer. Vertically it is pure CSS: a sticky phone in a track
 * that spans the spacer under the hero text through the end of both acts,
 * so it starts under the hero, pins at the middle of the screen and lets go
 * exactly when the story ends. Sideways it slides from the hero centre into
 * the right-hand column as the hero scrolls away (snapping instead under
 * reduced motion). Server HTML starts centred.
 */
function PhoneRig({ copy }: { copy: PhoneCopy }) {
  const layerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const layer = layerRef.current
      const spacer = document.querySelector('[data-phone-spacer]')
      const column = document.querySelector('[data-phone-column]')
      if (!layer || !spacer || !column) return
      const layerRect = layer.getBoundingClientRect()
      const spacerRect = spacer.getBoundingClientRect()
      const columnRect = column.getBoundingClientRect()
      // The layer starts where the spacer is and sticks once centred.
      const startTop = spacerRect.top + window.scrollY
      const stuckTop = (window.innerHeight - layerRect.height) / 2
      const travel = startTop - stuckTop
      const progress =
        travel > 0 ? Math.min(Math.max(window.scrollY / travel, 0), 1) : 1
      const target =
        columnRect.left +
        columnRect.width / 2 -
        (layerRect.left + layerRect.width / 2)
      x.set(
        reduced ? (progress >= 1 ? target : 0) : target * easeInOut(progress),
      )
    }
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [reduced, x])

  return (
    <Box
      position="absolute"
      inset={0}
      display={{ base: 'none', lg: 'block' }}
      zIndex={2}
      pointerEvents="none"
    >
      <Box
        ref={layerRef}
        display="flex"
        justifyContent="center"
        position="sticky"
        top={`calc(50vh - ${PHONE_H} / 2)`}
        h={PHONE_H}
      >
        <motion.div style={{ x, pointerEvents: 'auto' }}>
          <StickyPhone copy={copy} />
        </motion.div>
      </Box>
    </Box>
  )
}

type StepCopy = { title: string; body: string }

function StepBlock({
  stage,
  number,
  step,
  phone,
  intro,
  hint,
}: {
  stage: StoryStage
  number: number
  step: StepCopy
  phone: PhoneCopy
  /** Act heading, shown above the act's first step. */
  intro?: ReactNode
  hint?: string
}) {
  return (
    <StoryStageMarker
      stage={stage}
      minH={{ lg: '82vh' }}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      py={{ base: 10, lg: 16 }}
    >
      {intro}
      <Stack gap={3} maxW="30rem">
        <Text
          fontSize="sm"
          {...sdlFigure}
          letterSpacing="0.08em"
          color="text.link"
        >
          {String(number).padStart(2, '0')}
        </Text>
        <Heading
          as="h3"
          fontFamily="display"
          fontWeight={500}
          fontSize={{ base: '26px', lg: '34px' }}
          lineHeight={1.15}
          letterSpacing={{ base: '-0.02em', lg: '-0.03em' }}
        >
          {step.title}
        </Heading>
        <Text
          fontSize={{ base: 'md', lg: 'lg' }}
          lineHeight={1.6}
          color="text.muted"
        >
          {step.body}
        </Text>
        {hint ? (
          <HStack
            gap={2}
            mt={2}
            fontSize="sm"
            fontWeight={500}
            color="text.link"
          >
            <LuPointer size={16} aria-hidden />
            <Text>{hint}</Text>
          </HStack>
        ) : null}
      </Stack>
      <StepPhone
        stage={stage}
        copy={phone}
        display={{ base: 'flex', lg: 'none' }}
        mt={8}
      />
    </StoryStageMarker>
  )
}

function ActIntro({
  id,
  eyebrow,
  heading,
}: {
  id: string
  eyebrow: string
  heading: string
}) {
  return (
    <Stack gap={2} mb={{ base: 4, lg: 8 }}>
      <Text {...sdlEyebrow}>{eyebrow}</Text>
      <Heading
        as="h2"
        id={id}
        fontFamily="display"
        fontWeight={500}
        fontSize={{ base: '32px', lg: '44px' }}
        lineHeight={1.1}
        letterSpacing={{ base: '-0.025em', lg: '-0.035em' }}
      >
        {heading}
      </Heading>
    </Stack>
  )
}

function Act({
  id,
  eyebrow,
  heading,
  steps,
  phone,
  hint,
}: {
  id?: string
  eyebrow: string
  heading: string
  steps: { stage: StoryStage; copy: StepCopy }[]
  phone: PhoneCopy
  hint?: string
}) {
  const headingId = `${steps[0]?.stage}-heading`
  return (
    <Box as="section" id={id} aria-labelledby={headingId}>
      <Container maxW={PAGE_CONTAINER_MAX_W} px={PAGE_GUTTER_X}>
        <Grid
          templateColumns={{ base: '1fr', lg: 'minmax(0, 1fr) minmax(0, 1fr)' }}
          gap={{ lg: 16 }}
        >
          <Box>
            {steps.map(({ stage, copy }, index) => (
              <StepBlock
                key={stage}
                stage={stage}
                number={index + 1}
                step={copy}
                phone={phone}
                hint={index === 0 ? hint : undefined}
                intro={
                  index === 0 ? (
                    <ActIntro
                      id={headingId}
                      eyebrow={eyebrow}
                      heading={heading}
                    />
                  ) : undefined
                }
              />
            ))}
          </Box>
          <Box data-phone-column display={{ base: 'none', lg: 'block' }} />
        </Grid>
      </Container>
    </Box>
  )
}

/**
 * The scroll story: hero, then the customer act and the worker act, with the
 * demo phone pinned beside the steps on desktop and inline on phones.
 */
export function LandingStory({
  hero,
  story,
  phone,
}: {
  hero: ReactNode
  story: StoryCopy
  phone: PhoneCopy
}) {
  const customer = story.customer
  const worker = story.worker
  return (
    <Box position="relative">
      <HeroObjectsPoster />
      <StoryStageMarker stage="hero">
        {hero}
        <StepPhone
          stage="hero"
          copy={phone}
          display={{ base: 'flex', lg: 'none' }}
          pb={8}
        />
      </StoryStageMarker>
      {/* The phone's track: from under the hero text to the end of the
          worker act. */}
      <Box position="relative">
        <StoryStageMarker
          stage="hero"
          data-phone-spacer
          display={{ base: 'none', lg: 'block' }}
          h={`calc(${PHONE_H} + 6vh)`}
        />
        <Act
          id="how-it-works"
          eyebrow={customer.eyebrow}
          heading={customer.heading}
          hint={story.tapHint}
          phone={phone}
          steps={[
            { stage: 'post', copy: customer.steps.post },
            { stage: 'quotes', copy: customer.steps.quotes },
            { stage: 'chat', copy: customer.steps.chat },
            { stage: 'hire', copy: customer.steps.hire },
            { stage: 'review', copy: customer.steps.review },
          ]}
        />
        <Act
          eyebrow={worker.eyebrow}
          heading={worker.heading}
          phone={phone}
          steps={[
            { stage: 'workerFind', copy: worker.steps.workerFind },
            { stage: 'workerQuote', copy: worker.steps.workerQuote },
            { stage: 'workerProfile', copy: worker.steps.workerProfile },
          ]}
        />
        <PhoneRig copy={phone} />
      </Box>
    </Box>
  )
}
