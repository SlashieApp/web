'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { LuStar } from 'react-icons/lu'

import type { PhoneCopy } from '../phoneCopy'
import { CompactBar, Hotspot } from '../phoneParts'
import { useDemoBeat, useTypewriter } from '../useDemoBeat'
import {
  FlowAction,
  FlowField,
  FlowShell,
  ResultHead,
  stepCaption,
} from './stepFlowParts'
import { TaskAppBar } from './taskPageParts'

/**
 * Where the flow is: Stars (the visitor acts here), the five stars given,
 * Comment, Send your review, Submit review being pressed, then the finished
 * job's page with the review on it.
 */
type Phase = 'stars' | 'rated' | 'comment' | 'submit' | 'submitting' | 'done'

/** The app's Review flow has three steps. */
const TOTAL = 3
const STEP = { stars: 1, comment: 2, submit: 3 } as const

const COMMENT_MS = 950
const SUBMIT_MS = 2500
const SUBMITTING_MS = 3600
const DONE_MS = 4050

/** Five stars, `filled` of them green (the app's rating), each filling in turn. */
function StarRow({ filled, size }: { filled: number; size: number }) {
  return (
    <HStack gap={size >= 28 ? '10px' : '4px'} data-stars={filled}>
      {[0, 1, 2, 3, 4].map((n) => {
        const on = n < filled
        return (
          <Box
            key={n}
            display="inline-flex"
            color={on ? 'action.primary' : 'border.strong'}
            transition={`color 200ms ease-out ${n * 90}ms`}
            css={{
              '& svg': {
                fill: on ? 'currentColor' : 'transparent',
                transition: `fill 200ms ease-out ${n * 90}ms`,
              },
            }}
            aria-hidden
          >
            <LuStar size={size} />
          </Box>
        )
      })}
    </HStack>
  )
}

/**
 * Leaving a review, as the app's flow does it: on Stars the visitor gives
 * five; the demo goes on through Comment (a few words, typed) to Send your
 * review, Submit review is pressed, and the screen lands on the finished
 * job's page with "Your review" on it. `compact` is the cropped phone's
 * layout of the same steps.
 */
export function ReviewScreen({
  copy,
  active,
  intro,
  compact = false,
}: {
  copy: PhoneCopy
  active: boolean
  intro?: boolean
  compact?: boolean
}) {
  const { done, trigger, reduced } = useDemoBeat(active, intro)
  const [phase, setPhase] = useState<Phase>('stars')
  const f = copy.review.flow
  const task = copy.tasks.hedge
  const text = useTypewriter(f.text, phase === 'comment', reduced, 200)

  useEffect(() => {
    if (!done) {
      setPhase('stars')
      return
    }
    if (reduced) {
      setPhase('done')
      return
    }
    setPhase('rated')
    const timers = [
      window.setTimeout(() => setPhase('comment'), COMMENT_MS),
      window.setTimeout(() => setPhase('submit'), SUBMIT_MS),
      window.setTimeout(() => setPhase('submitting'), SUBMITTING_MS),
      window.setTimeout(() => setPhase('done'), DONE_MS),
    ]
    return () => {
      for (const timer of timers) window.clearTimeout(timer)
    }
  }, [done, reduced])

  if (phase === 'done') {
    const yours = (
      <Stack
        gap={compact ? '4px' : '8px'}
        p={compact ? '10px' : '16px'}
        borderWidth="1px"
        borderColor="border.default"
        borderRadius="12px"
        data-your-review=""
      >
        <HStack justify="space-between" gap="8px">
          <Text
            fontSize={compact ? '12px' : '14px'}
            lineHeight={compact ? '16px' : '20px'}
            fontWeight={500}
          >
            {f.yours}
          </Text>
          <StarRow filled={5} size={compact ? 12 : 16} />
        </HStack>
        <Text
          fontSize={compact ? '12px' : '14px'}
          lineHeight={compact ? '17px' : '21px'}
          color="text.muted"
          lineClamp={compact ? 1 : 3}
        >
          {f.text}
        </Text>
        {compact ? null : (
          <Box
            alignSelf="flex-start"
            h="36px"
            px="14px"
            mt="4px"
            borderRadius="full"
            borderWidth="1px"
            borderColor="border.strong"
            display="flex"
            alignItems="center"
            fontSize="14px"
            fontWeight={500}
          >
            {f.edit}
          </Box>
        )}
      </Stack>
    )
    if (compact) {
      return (
        <Box position="absolute" inset={0} bg="bg.surface" data-reviewed="">
          <CompactBar icon="back" title={task.title} sub={f.completed} />
          <Stack
            gap="10px"
            px="12px"
            pt="10px"
            css={{
              animation: 'fade-rise 380ms cubic-bezier(0.2, 0, 0, 1) both',
            }}
          >
            <ResultHead
              pill={f.completed}
              tone="neutral"
              headline={f.completedHeadline}
              compact
            />
            {yours}
          </Stack>
        </Box>
      )
    }
    return (
      <Box position="absolute" inset={0} bg="bg.surface" data-reviewed="">
        <TaskAppBar title={task.title} />
        <Stack
          gap="20px"
          px="16px"
          pt="20px"
          css={{ animation: 'fade-rise 380ms cubic-bezier(0.2, 0, 0, 1) both' }}
        >
          <ResultHead
            pill={f.completed}
            tone="neutral"
            headline={f.completedHeadline}
            subline={f.completedSubline}
          />
          {yours}
        </Stack>
      </Box>
    )
  }

  const step =
    phase === 'stars' || phase === 'rated'
      ? 'stars'
      : phase === 'comment'
        ? 'comment'
        : 'submit'
  const shell = {
    title: f.header,
    caption: stepCaption(f.progress, STEP[step], TOTAL, f.steps[step]),
    progress: STEP[step] / TOTAL,
    stepKey: step,
    back: step !== 'stars',
    compact,
  }

  if (step === 'stars') {
    return (
      <FlowShell
        {...shell}
        heading={f.starsTitle}
        description={f.starsDescription}
        action={
          <FlowAction
            label={f.continue}
            pressing={phase === 'rated'}
            compact={compact}
          />
        }
      >
        <Stack gap={compact ? '4px' : '8px'}>
          <Text
            fontSize={compact ? '12px' : '14px'}
            lineHeight={compact ? '16px' : '17px'}
            fontWeight={500}
          >
            {f.ratingLabel}
          </Text>
          <Hotspot
            label={f.rate}
            onPress={trigger}
            pulse={!done}
            borderRadius="12px"
            alignSelf="flex-start"
            p="6px"
            m="-6px"
          >
            <StarRow
              filled={phase === 'rated' ? 5 : 0}
              size={compact ? 26 : 32}
            />
          </Hotspot>
          <Text
            fontSize="12px"
            lineHeight="16px"
            color="text.muted"
            pt={compact ? 0 : '4px'}
          >
            {f.starsHint}
          </Text>
        </Stack>
      </FlowShell>
    )
  }

  if (step === 'comment') {
    return (
      <FlowShell
        {...shell}
        heading={f.commentTitle}
        description={f.commentDescription}
        action={<FlowAction label={f.continue} compact={compact} />}
      >
        <FlowField label={f.commentLabel} value={text} tall compact={compact} />
      </FlowShell>
    )
  }

  return (
    <FlowShell
      {...shell}
      heading={f.submitTitle}
      description={f.submitDescription}
      action={
        <FlowAction
          label={f.submit}
          arrow={false}
          pressing={phase === 'submitting'}
          compact={compact}
        />
      }
    >
      <Stack gap={compact ? '6px' : '12px'}>
        <StarRow filled={5} size={compact ? 14 : 18} />
        <Text
          fontSize={compact ? '13px' : '15px'}
          lineHeight={compact ? '18px' : '22px'}
        >
          {f.text}
        </Text>
      </Stack>
    </FlowShell>
  )
}
