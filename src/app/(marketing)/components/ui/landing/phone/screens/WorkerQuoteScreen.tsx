'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { LuArrowLeft } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'

import type { PhoneCopy } from '../phoneCopy'
import { CompactBar, Hotspot } from '../phoneParts'
import { useDemoBeat } from '../useDemoBeat'
import {
  FlowAction,
  FlowField,
  FlowGroup,
  FlowRadio,
  FlowShell,
  FlowSummary,
  ResultHead,
  ResultRow,
  stepCaption,
} from './stepFlowParts'
import { PinnedAction, PinnedBar, TaskAppBar } from './taskPageParts'

/**
 * Where the flow is: Your price (the visitor acts here), Times, Review your
 * quote, Send quote being pressed, then the task page with the quote sent.
 */
type Phase = 'price' | 'times' | 'review' | 'sending' | 'sent'

/** The app's Send a quote flow: Your quote (price, times), then Review & send. */
const TOTAL = 2
const STEP = { price: 1, times: 1, review: 2 } as const
/** How far the track has filled on each step (the flow counts its sub-steps). */
const PROGRESS = { price: 0.2, times: 0.6, review: 1 } as const

const REVIEW_MS = 800
const SENDING_MS = 2100
const SENT_MS = 2550

/**
 * Sending a quote, as the app's flow does it: the worker is on Your price
 * with their price typed (the customer's budget under it). Continue taps
 * through the time they offer to Review your quote, Send quote is pressed,
 * and the screen lands on the task's page: "Quote sent". `compact` is the
 * cropped phone's layout of the same steps.
 */
export function WorkerQuoteScreen({
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
  const [phase, setPhase] = useState<Phase>('price')
  const f = copy.worker.flow
  const task = copy.tasks.wardrobe

  useEffect(() => {
    if (!done) {
      setPhase('price')
      return
    }
    if (reduced) {
      setPhase('sent')
      return
    }
    setPhase('times')
    const timers = [
      window.setTimeout(() => setPhase('review'), REVIEW_MS),
      window.setTimeout(() => setPhase('sending'), SENDING_MS),
      window.setTimeout(() => setPhase('sent'), SENT_MS),
    ]
    return () => {
      for (const timer of timers) window.clearTimeout(timer)
    }
  }, [done, reduced])

  if (phase === 'sent') {
    const rows = (
      <>
        <ResultRow
          label={f.yourQuote}
          value={f.price}
          strong
          compact={compact}
        />
        <ResultRow label={f.proposedTimes} value={f.slot} compact={compact} />
      </>
    )
    if (compact) {
      return (
        <Box position="absolute" inset={0} bg="bg.surface" data-quote-sent="">
          <CompactBar icon="back" title={task.title} sub={f.open} />
          <Stack
            gap="8px"
            px="12px"
            pt="10px"
            css={{
              animation: 'fade-rise 380ms cubic-bezier(0.2, 0, 0, 1) both',
            }}
          >
            <ResultHead
              pill={f.open}
              headline={f.sentHeadline}
              subline={f.sentSubline}
              compact
            />
            <Box>{rows}</Box>
          </Stack>
        </Box>
      )
    }
    return (
      <Box position="absolute" inset={0} bg="bg.surface" data-quote-sent="">
        <TaskAppBar title={task.title} />
        <Stack
          gap="20px"
          px="16px"
          pt="20px"
          css={{ animation: 'fade-rise 380ms cubic-bezier(0.2, 0, 0, 1) both' }}
        >
          <ResultHead
            pill={f.open}
            headline={f.sentHeadline}
            subline={f.sentSubline}
          />
          <Box>{rows}</Box>
        </Stack>
        <PinnedBar>
          <PinnedAction>{f.editQuote}</PinnedAction>
        </PinnedBar>
      </Box>
    )
  }

  const step = phase === 'sending' ? 'review' : phase
  const meta = f.steps[step]
  // The flow shows the task it quotes on above its steps.
  const intro_ = compact ? null : (
    <Stack gap="4px" px="16px" pb="12px">
      <HStack
        gap="4px"
        color="status.success.fg"
        fontSize="13px"
        fontWeight={500}
      >
        <LuArrowLeft size={14} aria-hidden />
        {f.backToTask}
      </HStack>
      <Text fontSize="16px" lineHeight="22px" fontWeight={500} lineClamp={1}>
        {task.title}
      </Text>
    </Stack>
  )
  const shell = {
    title: f.header,
    caption: stepCaption(f.progress, STEP[step], TOTAL, meta.label),
    progress: PROGRESS[step],
    heading: meta.title,
    description: meta.description,
    stepKey: step,
    back: step !== 'price',
    intro: intro_,
    compact,
  }

  if (step === 'price') {
    return (
      <FlowShell
        {...shell}
        action={
          <Hotspot
            label={f.continue}
            onPress={trigger}
            pulse={!done}
            borderRadius="full"
            w="full"
          >
            <FlowAction label={f.continue} compact={compact} />
          </Hotspot>
        }
      >
        <FlowField
          label={f.priceLabel}
          prefix="£"
          value={f.priceAmount}
          helper={formatMessage(f.priceHelper, { budget: f.budget })}
          compact={compact}
        />
      </FlowShell>
    )
  }

  if (step === 'times') {
    return (
      <FlowShell
        {...shell}
        action={<FlowAction label={f.continue} compact={compact} />}
      >
        <FlowGroup label={f.proposedTimes} compact={compact}>
          <FlowRadio label={f.slot} selected compact={compact} />
        </FlowGroup>
      </FlowShell>
    )
  }

  return (
    <FlowShell
      {...shell}
      action={
        <FlowAction
          label={f.submit}
          arrow={false}
          pressing={phase === 'sending'}
          compact={compact}
        />
      }
    >
      <Stack gap={compact ? '6px' : '12px'}>
        <FlowSummary label={f.priceLabel} value={f.price} compact={compact} />
        <FlowSummary label={f.proposedTimes} value={f.slot} compact={compact} />
        {compact ? null : (
          <FlowSummary label={f.messageLabel} value={f.message} />
        )}
      </Stack>
    </FlowShell>
  )
}
