import { WorkerSubscriptionStatus } from '@codegen/schema'
import type { Decorator } from '@storybook/nextjs-vite'
import { type ReactNode, useCallback } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { type MeSnapshot, useUserStore } from '@/app/(auth)/store/user'
import {
  storyDateInDays,
  storyImage,
} from '@/app/(stepflow)/stepflowStoryHelpers'
import { useTaskDetail } from '@/app/(task)/tasks/[slug]/context/TaskDetailProvider'
import { withTaskDetailStory } from '@/app/(task)/tasks/[slug]/helpers/taskDetailStoryDecorator'
import {
  type TaskDetailStoryConfig,
  storyTaskDetail,
} from '@/app/(task)/tasks/[slug]/helpers/taskDetailStoryFixtures'
import type { TaskDetailRecord } from '@/app/(task)/tasks/[slug]/helpers/taskDetailUtils'
import type { TimeSlotDraft } from '@/utils/timeSlots'

import {
  TASK_QUOTE_FIRST_SUB_STEP,
  TASK_QUOTE_STEP_COPY,
  type TaskQuoteSubStepId,
  taskQuoteNextSubStep,
} from '../helpers/taskQuoteSteps.config'

/** Where the story flows exit to (the task the quote is for). */
export const STORY_BACK_TO_TASK = '/tasks/task-detail-story-1'

/** An open task nobody has quoted yet, with a placeholder photo. */
export function quoteStoryTask(
  overrides: Partial<TaskDetailRecord> = {},
): TaskDetailRecord {
  return storyTaskDetail({
    images: [storyImage('#9ec5e8', 144)],
    quotes: [],
    ...overrides,
  })
}

/** Two valid proposed times inside the picker's window. */
export function quoteStorySlots(): TimeSlotDraft[] {
  return [
    { date: storyDateInDays(7), time: '09:00', durationMinutes: 120 },
    { date: storyDateInDays(8), time: '14:00', durationMinutes: null },
  ]
}

export const QUOTE_STORY_MESSAGE =
  'Hi! I can do this on Saturday morning with my own drill and fixings. Happy to bring a spirit level and check the wall first.'

/** A free-plan worker who has used every free quote this month. */
export const LIMIT_REACHED_MEMBERSHIP = {
  planName: 'Free',
  statusLabel: 'Free plan',
  statusDescription: null,
  subscriptionStatus: WorkerSubscriptionStatus.None,
  hasUnlimitedQuotes: false,
  cancelAtPeriodEnd: false,
  canceledAt: null,
  freeQuotesPerMonth: 5,
  quotesUsedThisMonth: 5,
  quotesRemainingThisMonth: 0,
  trialEndsAt: null,
  currentPeriodEnd: null,
  canStartTrial: true,
  canManageBilling: false,
  canUpgrade: true,
}

export type QuoteStoryForm = {
  /** Price in pence, as the flow keeps it once the price step is passed. */
  amountPence?: string
  message?: string
  slots?: TimeSlotDraft[]
}

type QuoteStoryOptions = {
  form?: QuoteStoryForm
  /** Changes the signed-in worker after the base decorator has seeded them. */
  me?: (me: MeSnapshot) => Partial<MeSnapshot>
  maxWidth?: string
}

/**
 * Seeds what the real provider keeps in state (the quote form) and, when
 * asked, adjusts the signed-in user. The base decorator writes the user in
 * a later effect, so the adjustment is re-applied whenever the store changes.
 */
function QuoteStorySeed({
  form,
  me,
  children,
}: Pick<QuoteStoryOptions, 'form' | 'me'> & { children: ReactNode }) {
  const { setQuoteAmountInput, setQuoteMessageInput, setQuoteSlots } =
    useTaskDetail()

  const seed = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return
      if (form?.amountPence) setQuoteAmountInput(form.amountPence)
      if (form?.message) setQuoteMessageInput(form.message)
      if (form?.slots) setQuoteSlots(form.slots)
      if (!me) return

      let last: MeSnapshot | null = null
      const apply = () => {
        const current = useUserStore.getState().me
        if (!current || current === last) return
        last = { ...current, ...me(current) } as MeSnapshot
        useUserStore.setState({ me: last })
      }
      apply()
      return useUserStore.subscribe(apply)
    },
    [form, me, setQuoteAmountInput, setQuoteMessageInput, setQuoteSlots],
  )

  return (
    <>
      <div ref={seed} hidden />
      {children}
    </>
  )
}

/**
 * The real task-detail provider (via `withTaskDetailStory`) for a worker on
 * an open, unquoted task, plus an optionally seeded quote form.
 */
export function withQuoteStory(
  config: Partial<TaskDetailStoryConfig> = {},
  { form, me, maxWidth = '100%' }: QuoteStoryOptions = {},
): Decorator {
  const base = withTaskDetailStory(
    { viewer: 'worker', task: quoteStoryTask(), ...config },
    { maxWidth },
  )
  return (Story, context) =>
    base(
      () => (
        <QuoteStorySeed form={form} me={me}>
          <Story />
        </QuoteStorySeed>
      ),
      context,
    )
}

/** Generous, so a loaded CI machine does not flake the play functions. */
const WAIT = { timeout: 3000 }

/** Types a price and presses Continue until `target` is on screen. */
export async function advanceQuoteTo(
  canvasElement: HTMLElement,
  target: TaskQuoteSubStepId,
  price = '85',
) {
  const canvas = within(canvasElement)
  if (price) {
    await userEvent.type(
      await canvas.findByPlaceholderText('0.00', undefined, WAIT),
      price,
    )
  }
  let step: TaskQuoteSubStepId | null = TASK_QUOTE_FIRST_SUB_STEP
  while (step && step !== target) {
    await userEvent.click(
      await canvas.findByRole(
        'button',
        { name: /^(continue|send quote|update quote)/i },
        WAIT,
      ),
    )
    step = taskQuoteNextSubStep(step)
    if (step) {
      await expect(
        await canvas.findByRole(
          'heading',
          { name: TASK_QUOTE_STEP_COPY[step].title },
          WAIT,
        ),
      ).toBeVisible()
    }
  }
}
