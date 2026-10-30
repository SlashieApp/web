'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'
import { LuUndo2 } from 'react-icons/lu'

import taskDetailBag from '@/app/(task)/tasks/[slug]/i11n.json'
import { useI11n } from '@/i18n/useI11n'
import { hitAreaGrowth } from '@/theme/styles'
import { timeSlotDraftFromSlot } from '@/utils/timeSlots'

import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import { workerSetupHref } from '@/app/(stepflow)/worker/setup/helpers/workerSetupHref'
import { Box } from '@chakra-ui/react'

import { SessionLoading } from '@/app/(auth)/components/ui/SessionLoading'

import { Button, Link } from '@ui'

import { WithdrawQuoteDialog } from '@/app/(task)/tasks/[slug]/components/overview/TaskConfirmDialogs'
import { QuoteLimitPaywall } from '@/app/(task)/tasks/[slug]/components/quotes/QuoteLimitPaywall'
import { useTaskDetail } from '@/app/(task)/tasks/[slug]/context/TaskDetailProvider'
import quoteBag from '../i11n.json'
import { TaskQuoteScreen } from './TaskQuoteScreen'
import { TaskQuoteGateView } from './ui/shared/TaskQuoteGateView'
import { TaskQuoteSummaryCard } from './ui/shared/TaskQuoteSummaryCard'

function taskDetailHref(taskId: string) {
  return `/tasks/${taskId}`
}

export function TaskQuoteFlow() {
  const router = useRouter()
  const {
    task,
    permissions,
    myQuote,
    me,
    isAuthenticated,
    meLoading,
    quoteLimitReached,
    quoteSuccess,
    setQuoteMessageInput,
    setQuoteSlots,
    withdrawingQuote,
  } = useTaskDetail()
  const t = useI11n(taskDetailBag)
  const gate = useI11n(quoteBag).gate

  const redirectedRef = useRef(false)
  const prefilledRef = useRef(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)

  const { isOwner, hasWorkerProfile, canSubmitQuote, hasPendingQuote } =
    permissions

  const backToTask = task ? taskDetailHref(task.id) : '/tasks'
  // Updating a pending quote sends another addQuote; the latest one wins.
  const existingQuote = hasPendingQuote ? myQuote : null

  const shouldRedirectToTaskDetail = Boolean(
    task &&
      !quoteSuccess &&
      (isOwner ||
        // Has a quote but can neither edit it (pending, on an open task) nor
        // send a new one (FE-274): a worker whose quote is over still can.
        (myQuote && !hasPendingQuote && !canSubmitQuote) ||
        (isAuthenticated &&
          !meLoading &&
          hasWorkerProfile &&
          me &&
          isEmailVerified(me) &&
          !quoteLimitReached &&
          !canSubmitQuote)),
  )

  const redirectToTaskDetailRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !task || redirectedRef.current) return
      if (isAuthenticated && meLoading) return
      if (!shouldRedirectToTaskDetail) return
      redirectedRef.current = true
      router.replace(backToTask)
    },
    [
      backToTask,
      isAuthenticated,
      meLoading,
      router,
      shouldRedirectToTaskDetail,
      task,
    ],
  )

  const prefillExistingQuoteRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || prefilledRef.current || !existingQuote) return
      prefilledRef.current = true
      setQuoteMessageInput(existingQuote.message ?? '')
      // Slot ids are reissued on every addQuote; keep the still-future times.
      setQuoteSlots(
        existingQuote.proposedSlots.flatMap((slot) => {
          const draft = timeSlotDraftFromSlot(slot)
          return draft ? [draft] : []
        }),
      )
    },
    [existingQuote, setQuoteMessageInput, setQuoteSlots],
  )

  if (!task) return null

  const loginHref = `/login?next=${encodeURIComponent(`${backToTask}/quote`)}`

  if (isAuthenticated && meLoading) {
    return <SessionLoading ref={redirectToTaskDetailRef} />
  }

  if (shouldRedirectToTaskDetail) {
    return <SessionLoading ref={redirectToTaskDetailRef} />
  }

  if (!isAuthenticated) {
    return (
      <Box minH="100dvh" bg="bg.canvas">
        <TaskQuoteGateView
          title={t.cta.sendQuote}
          description={gate.signInBody}
          backHref={backToTask}
        >
          <TaskQuoteSummaryCard />
          <Button asChild w="full" size="form">
            <Link href={loginHref} _hover={{ textDecoration: 'none' }}>
              {gate.logIn}
            </Link>
          </Button>
        </TaskQuoteGateView>
      </Box>
    )
  }

  if (!hasWorkerProfile) {
    return (
      <Box minH="100dvh" bg="bg.canvas">
        <TaskQuoteGateView
          title={t.cta.sendQuote}
          description={gate.workerProfileBody}
          backHref={backToTask}
        >
          <TaskQuoteSummaryCard />
          <Button asChild w="full" size="form">
            <Link
              href={workerSetupHref(`${backToTask}/quote`)}
              _hover={{ textDecoration: 'none' }}
            >
              {gate.createWorkerProfile}
            </Link>
          </Button>
        </TaskQuoteGateView>
      </Box>
    )
  }

  // The monthly limit caps distinct tasks; edits on a quoted task are unlimited.
  if (quoteLimitReached && !existingQuote) {
    return (
      <Box minH="100dvh" bg="bg.canvas">
        <TaskQuoteGateView
          title={t.cta.sendQuote}
          description={gate.limitBody}
          backHref={backToTask}
        >
          <TaskQuoteSummaryCard />
          <QuoteLimitPaywall />
        </TaskQuoteGateView>
      </Box>
    )
  }

  if (me && !isEmailVerified(me)) {
    return (
      <Box minH="100dvh" bg="bg.canvas">
        <TaskQuoteGateView
          title={gate.verifyEmailTitle}
          description={t.provider.verifyEmailBeforeQuote}
          backHref={backToTask}
        >
          <TaskQuoteSummaryCard />
          <Button asChild w="full" size="form">
            <Link href="/verify-email/sent" _hover={{ textDecoration: 'none' }}>
              {gate.checkInbox}
            </Link>
          </Button>
        </TaskQuoteGateView>
      </Box>
    )
  }

  if (!existingQuote) {
    return (
      <Box>
        <TaskQuoteScreen backToTask={backToTask} />
      </Box>
    )
  }

  return (
    <Box ref={prefillExistingQuoteRef}>
      <TaskQuoteScreen
        key={existingQuote.id}
        backToTask={backToTask}
        initialPounds={
          existingQuote.price ? String(existingQuote.price.amount) : ''
        }
        submitLabel={t.cta.updateQuote}
        footer={
          <Button
            type="button"
            variant="ghost"
            color="status.danger.fg"
            alignSelf="flex-start"
            px={0}
            // A line of text, 20 under the step's last field like any field
            // group (the stack above sets it); it is 44 to tap, reaching into
            // the gaps around it.
            h="auto"
            minH={0}
            borderWidth={0}
            lineHeight="20px"
            {...hitAreaGrowth(20)}
            loading={withdrawingQuote}
            onClick={() => setWithdrawOpen(true)}
          >
            <LuUndo2 />
            {t.actions.withdrawQuote}
          </Button>
        }
      />
      <WithdrawQuoteDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        onWithdrawn={() => router.replace(backToTask)}
      />
    </Box>
  )
}
