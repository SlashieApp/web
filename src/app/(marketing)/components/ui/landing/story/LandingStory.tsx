'use client'

import { Box, Grid, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import type { IconType } from 'react-icons'
import { LuHardHat, LuPointer, LuUser } from 'react-icons/lu'

import {
  SECTION_PY,
  SectionHead,
} from '@/app/(marketing)/components/layout/MarketingFrame'
import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'

import { Reveal } from '../Reveal'
import { STICKY_PHONE_W, StepPhone, StickyPhone } from '../phone/PhoneDemo'
import { PHONE_ASPECT } from '../phone/PhoneFrame'
import type { PhoneCopy, StoryCopy } from '../phone/phoneCopy'
import { HeroObjectsPoster } from '../scene/HeroObjectsPoster'
import { StoryIndex } from './StoryIndex'
import { StoryStageMarker } from './StoryTracker'
import {
  STORY_HEADER_H,
  STORY_STEP_MIN_H,
  STORY_STEP_SCROLL_MARGIN,
} from './storyLayout'
import type { StoryStage } from './storyState'
import {
  CUSTOMER_STAGES,
  type CustomerStage,
  WORKER_STAGES,
  type WorkerStage,
  buildIndexGroups,
  stepDomId,
} from './storySteps'

const PHONE_H = `calc(${STICKY_PHONE_W} * ${PHONE_ASPECT})`

type StepCopy = { title: string; body: string }

/**
 * One step as a hairline row: its number in Geist Mono 12 (`text.subtle`,
 * never green), the title at 18/500 and the body at 14 in `text.muted`.
 *
 * The row is the step's story stage: the tracker marks it active when it
 * crosses the middle of the viewport, and the phone, the 3D scene and the
 * section index follow. The text sits at the top of the row, so it arrives
 * just under that line as the phone changes. From `lg` the row is tall enough
 * for the phone to stay on the step's screen while the text is read (and for a
 * fast scroll not to skip it, since the tracker watches a single line); below
 * `lg` it carries its own inline phone.
 */
function StepRow({
  stage,
  number,
  step,
  phone,
  hint,
}: {
  stage: StoryStage
  number: number
  step: StepCopy
  phone: PhoneCopy
  hint?: string
}) {
  return (
    <StoryStageMarker
      as="li"
      stage={stage}
      id={stepDomId(stage)}
      listStyleType="none"
      scrollMarginTop={STORY_STEP_SCROLL_MARGIN}
      minH={{ lg: STORY_STEP_MIN_H }}
      pt={{ base: 8, lg: 10 }}
      pb={{ base: 8, lg: 12 }}
      borderTopWidth="1px"
      borderColor="border.default"
      // The list's last row closes it with a hairline.
      css={{ '&:last-of-type': { borderBottomWidth: '1px' } }}
    >
      <Reveal>
        <Grid
          templateColumns="2.5rem minmax(0, 1fr)"
          alignItems="baseline"
          maxW="38rem"
        >
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
      </Reveal>
      <StepPhone
        stage={stage}
        copy={phone}
        display={{ base: 'flex', lg: 'none' }}
        mt={8}
      />
    </StoryStageMarker>
  )
}

/**
 * An act: its head (the eyebrow with a small green icon, then the heading)
 * over its steps as hairline rows. The head belongs to the act's first step, so
 * the phone and the index move to the act as soon as its head is mid-screen.
 */
function Act({
  icon,
  eyebrow,
  heading,
  steps,
  phone,
  hint,
  spaced = false,
}: {
  icon: IconType
  eyebrow: string
  heading: string
  steps: { stage: StoryStage; copy: StepCopy }[]
  phone: PhoneCopy
  hint?: string
  /** Leave a section's worth of space above (the second act). */
  spaced?: boolean
}) {
  const [first] = steps
  const headingId = `${first?.stage}-heading`
  return (
    <Box
      as="section"
      aria-labelledby={headingId}
      mt={spaced ? { base: 14, md: 20, lg: 24 } : 0}
    >
      {first ? (
        <StoryStageMarker stage={first.stage} pb={{ base: 6, lg: 8 }}>
          <Reveal>
            <SectionHead
              icon={icon}
              eyebrow={eyebrow}
              heading={heading}
              headingId={headingId}
            />
          </Reveal>
        </StoryStageMarker>
      ) : null}
      <Box as="ol" m={0} p={0} mt={{ base: 8, lg: 12 }} listStyleType="none">
        {steps.map(({ stage, copy }, index) => (
          <StepRow
            key={stage}
            stage={stage}
            number={index + 1}
            step={copy}
            phone={phone}
            hint={index === 0 ? hint : undefined}
          />
        ))}
      </Box>
    </Box>
  )
}

const customerSteps = (steps: StoryCopy['customer']['steps']) =>
  CUSTOMER_STAGES.map((stage: CustomerStage) => ({
    stage,
    copy: steps[stage],
  }))

const workerSteps = (steps: StoryCopy['worker']['steps']) =>
  WORKER_STAGES.map((stage: WorkerStage) => ({ stage, copy: steps[stage] }))

/**
 * The scroll story (tone refresh, train 2, item 4): the hero, then how it
 * works, the customer act and the worker act. A `showcase` (the map panel and
 * the bento, with their own section rules) sits between the two.
 *
 * How it works is three columns from `lg`: the section index (sticky, left),
 * the steps (middle) and the demo phone, pinned in the right column from the
 * first step to the last. Below `lg` it is one column: the index is a row that
 * sticks under the header and each step carries its own inline phone.
 *
 * The phone is plain CSS `position: sticky` in the right column, so the
 * server HTML already has it in place and reduced motion changes nothing.
 */
export function LandingStory({
  hero,
  showcase,
  story,
  phone,
}: {
  hero: ReactNode
  showcase?: ReactNode
  story: StoryCopy
  phone: PhoneCopy
}) {
  const { customer, worker } = story
  return (
    <Box position="relative">
      <HeroObjectsPoster />
      <StoryStageMarker stage="hero">{hero}</StoryStageMarker>
      {showcase}
      <Box
        id="how-it-works"
        data-how-it-works=""
        // "See how it works" lands the section under the sticky header.
        scrollMarginTop={STORY_HEADER_H}
      >
        <Box
          maxW={PAGE_CONTAINER_MAX_W}
          mx="auto"
          px={PAGE_GUTTER_X}
          py={SECTION_PY}
        >
          {/* From lg two halves, as the 3D scene's formations expect: the
              steps (with the index) on the left, the phone on the right. */}
          <Grid
            templateColumns={{
              lg: 'minmax(0, 1fr) 22rem',
              xl: 'repeat(2, minmax(0, 1fr))',
            }}
            columnGap={{ lg: 12, xl: 16 }}
          >
            {/* A block below lg, so the index can stick along both acts; a
                grid from lg, where it is one tall row the index sticks in. */}
            <Grid
              display={{ base: 'block', lg: 'grid' }}
              templateColumns={{
                lg: '9rem minmax(0, 1fr)',
                xl: '10rem minmax(0, 1fr)',
              }}
              columnGap={8}
              minW={0}
            >
              <StoryIndex
                label={story.index.label}
                groups={buildIndexGroups(story.index)}
              />
              <Box minW={0}>
                <Act
                  icon={LuUser}
                  eyebrow={customer.eyebrow}
                  heading={customer.heading}
                  hint={story.tapHint}
                  phone={phone}
                  steps={customerSteps(customer.steps)}
                />
                <Act
                  icon={LuHardHat}
                  eyebrow={worker.eyebrow}
                  heading={worker.heading}
                  phone={phone}
                  steps={workerSteps(worker.steps)}
                  spaced
                />
              </Box>
            </Grid>
            <Box data-phone-column="" display={{ base: 'none', lg: 'block' }}>
              <Box
                position="sticky"
                top={`calc(50vh - ${PHONE_H} / 2)`}
                display="flex"
                justifyContent="center"
                h={PHONE_H}
              >
                <StickyPhone copy={phone} />
              </Box>
            </Box>
          </Grid>
        </Box>
      </Box>
    </Box>
  )
}
