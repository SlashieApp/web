'use client'

import { Box, HStack, Stack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { LuEye, LuX } from 'react-icons/lu'

import type { PhoneCopy } from '../phoneCopy'
import { CompactBar, Hotspot } from '../phoneParts'
import { useDemoBeat, useTypewriter } from '../useDemoBeat'
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
 * Where the flow is: the Details step the visitor acts on, the steps the
 * demo taps through, Check and post, Post task being pressed, then the task
 * page it lands on.
 */
type Phase = 'details' | 'timing' | 'budget' | 'review' | 'posting' | 'posted'

/** The app's Post a task flow has seven steps; these are the ones shown. */
const TOTAL = 7
const STEP = { details: 3, timing: 4, budget: 6, review: 7 } as const

/** After Continue: each step shows briefly, the last is read, then posted. */
const BUDGET_MS = 700
const REVIEW_MS = 1400
const POSTING_MS = 2600
const POSTED_MS = 3050

/** A chosen category: a soft green chip with its remove mark, as the Details step draws it. */
function CategoryChip({ label, compact }: { label: string; compact: boolean }) {
  return (
    <HStack
      alignSelf="flex-start"
      gap="6px"
      h={compact ? '28px' : '32px'}
      px="10px"
      borderRadius="full"
      bg="status.success.soft"
      color="status.success.fg"
      fontSize={compact ? '12px' : '14px'}
      fontWeight={500}
    >
      {label}
      <LuX size={14} aria-hidden />
    </HStack>
  )
}

/**
 * Posting a task, as the app's flow does it (one question per step, the
 * progress track, Continue): the visitor is on Details, with the title typed
 * and a category chosen. Continue taps through Timing and Budget to Check and
 * post, Post task is pressed, and the screen lands on the new task's page:
 * Open, "Your task is live". Reduced motion rests on Details. `compact` is
 * the cropped phone's layout of the same steps.
 */
export function PostScreen({
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
  const { entered, done, trigger, reduced } = useDemoBeat(active, intro, false)
  const [phase, setPhase] = useState<Phase>('details')
  const f = copy.post.flow
  const taskTitle = copy.post.whatValue
  const title = useTypewriter(taskTitle, entered, reduced)

  useEffect(() => {
    if (!done) {
      setPhase('details')
      return
    }
    if (reduced) {
      setPhase('posted')
      return
    }
    setPhase('timing')
    const timers = [
      window.setTimeout(() => setPhase('budget'), BUDGET_MS),
      window.setTimeout(() => setPhase('review'), REVIEW_MS),
      window.setTimeout(() => setPhase('posting'), POSTING_MS),
      window.setTimeout(() => setPhase('posted'), POSTED_MS),
    ]
    return () => {
      for (const timer of timers) window.clearTimeout(timer)
    }
  }, [done, reduced])

  if (phase === 'posted') {
    const rows = (
      <>
        <ResultRow
          label={f.detailBudget}
          value={copy.post.budgetValue}
          strong
          compact={compact}
        />
        <ResultRow label={f.detailWhen} value={f.whenValue} compact={compact} />
        <ResultRow label={f.detailLocation} value={f.area} compact={compact} />
      </>
    )
    if (compact) {
      return (
        <Box position="absolute" inset={0} bg="bg.surface" data-posted="">
          <CompactBar icon="back" title={taskTitle} sub={f.open} />
          <Stack
            gap="8px"
            px="12px"
            pt="10px"
            css={{
              animation: 'fade-rise 380ms cubic-bezier(0.2, 0, 0, 1) both',
            }}
          >
            <ResultHead pill={f.open} headline={f.liveHeadline} compact />
            <Box>{rows}</Box>
          </Stack>
        </Box>
      )
    }
    return (
      <Box position="absolute" inset={0} bg="bg.surface" data-posted="">
        <TaskAppBar title={taskTitle} />
        <Stack
          gap="20px"
          px="16px"
          pt="20px"
          css={{ animation: 'fade-rise 380ms cubic-bezier(0.2, 0, 0, 1) both' }}
        >
          <ResultHead
            pill={f.open}
            headline={f.liveHeadline}
            subline={f.liveSubline}
          />
          <Box>{rows}</Box>
        </Stack>
        <PinnedBar>
          <PinnedAction icon={<LuEye size={16} aria-hidden />}>
            {f.preview}
          </PinnedAction>
        </PinnedBar>
      </Box>
    )
  }

  const step = phase === 'posting' ? 'review' : phase
  const meta = f.steps[step]
  const shell = {
    title: f.header,
    caption: stepCaption(f.progress, STEP[step], TOTAL, meta.label),
    progress: STEP[step] / TOTAL,
    heading: meta.title,
    description: meta.description,
    stepKey: step,
    back: true,
    compact,
  }

  if (step === 'details') {
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
        <FlowField label={f.titleLabel} value={title} compact={compact} />
        <FlowGroup label={f.categoriesLabel} compact={compact}>
          <CategoryChip label={f.category} compact={compact} />
        </FlowGroup>
      </FlowShell>
    )
  }

  if (step === 'timing') {
    return (
      <FlowShell
        {...shell}
        action={<FlowAction label={f.continue} compact={compact} />}
      >
        <FlowGroup label={f.whenLabel} compact={compact}>
          <FlowRadio label={f.whenFlexible} compact={compact} />
          {compact ? null : <FlowRadio label={f.whenBefore} />}
          <FlowRadio label={f.whenExact} selected compact={compact} />
        </FlowGroup>
      </FlowShell>
    )
  }

  if (step === 'budget') {
    return (
      <FlowShell
        {...shell}
        action={<FlowAction label={f.continue} compact={compact} />}
      >
        <FlowGroup label={f.budgetTypeLabel} compact={compact}>
          <FlowRadio label={f.budgetOneOff} selected compact={compact} />
          {compact ? null : <FlowRadio label={f.budgetPerHour} />}
        </FlowGroup>
        <FlowField
          label={f.summaryBudget}
          prefix="£"
          value={f.budgetAmount}
          compact={compact}
        />
        {compact ? null : (
          <FlowGroup label={f.paymentLabel}>
            <FlowRadio label={f.paymentCash} selected />
          </FlowGroup>
        )}
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
          pressing={phase === 'posting'}
          compact={compact}
        />
      }
    >
      <Stack gap={compact ? '6px' : '12px'}>
        <FlowSummary
          label={f.summaryTask}
          value={taskTitle}
          compact={compact}
        />
        {compact ? null : (
          <>
            <FlowSummary label={f.summaryArea} value={f.area} />
            <FlowSummary label={f.summaryWhen} value={f.whenValue} />
          </>
        )}
        <FlowSummary
          label={f.summaryBudget}
          value={`${copy.post.budgetValue} · ${f.paymentCash}`}
          compact={compact}
        />
      </Stack>
    </FlowShell>
  )
}
