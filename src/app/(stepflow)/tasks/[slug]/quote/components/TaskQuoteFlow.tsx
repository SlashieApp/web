'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useRef } from 'react'
import { LuUndo2 } from 'react-icons/lu'

import taskDetailBag from '@/app/(task)/tasks/[slug]/i11n.json'
import { useI11n } from '@/i18n/useI11n'

import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import { workerSetupHref } from '@/app/(stepflow)/worker/setup/helpers/workerSetupHref'
import { Box } from '@chakra-ui/react'

import { SessionLoading } from '@/app/(auth)/components/ui/SessionLoading'

import { Button, Link } from '@ui'

import { QuoteLimitPaywall } from '@/app/(task)/tasks/[slug]/components/quotes/QuoteLimitPaywall'
import { useTaskDetail } from '@/app/(task)/tasks/[slug]/context/TaskDetailProvider'
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
    onWithdrawQuote,
    withdrawingQuote,
  } = useTaskDetail()
  const t = useI11n(taskDetailBag)

  const redirectedRef = useRef(false)
  const prefilledRef = useRef(false)

  const { isOwner, hasWorkerProfile, showQuoteForm, hasPendingQuote } =
    permissions

  const backToTask = task ? taskDetailHref(task.id) : '/tasks'
  // Updating a pending quote sends another addQuote; the latest one wins.
  const existingQuote = hasPendingQuote ? myQuote : null

  const shouldRedirectToTaskDetail = Boolean(
    task &&
      !quoteSuccess &&
      (isOwner ||
        (myQuote && !hasPendingQuote) ||
        (isAuthenticated &&
          !meLoading &&
          hasWorkerProfile &&
          me &&
          isEmailVerified(me) &&
          !quoteLimitReached &&
          !showQuoteForm)),
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
    },
    [existingQuote, setQuoteMessageInput],
  )

  const withdrawExistingQuote = useCallback(async () => {
    const withdrawn = await onWithdrawQuote()
    if (withdrawn) router.replace(backToTask)
  }, [backToTask, onWithdrawQuote, router])

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
      <Box minH="100dvh" bg="bg.subtle">
        <TaskQuoteGateView
          title="Send quote"
          description="Sign in to send a quote for this task."
          backHref={backToTask}
        >
          <TaskQuoteSummaryCard />
          <Link href={loginHref} _hover={{ textDecoration: 'none' }}>
            <Button w="full">Log in</Button>
          </Link>
        </TaskQuoteGateView>
      </Box>
    )
  }

  if (!hasWorkerProfile) {
    return (
      <Box minH="100dvh" bg="bg.subtle">
        <TaskQuoteGateView
          title="Send quote"
          description="Create your worker profile before you can send quotes."
          backHref={backToTask}
        >
          <TaskQuoteSummaryCard />
          <Link
            href={workerSetupHref(`${backToTask}/quote`)}
            _hover={{ textDecoration: 'none' }}
          >
            <Button w="full">Create worker profile</Button>
          </Link>
        </TaskQuoteGateView>
      </Box>
    )
  }

  // The monthly limit caps distinct tasks; edits on a quoted task are unlimited.
  if (quoteLimitReached && !existingQuote) {
    return (
      <Box minH="100dvh" bg="bg.subtle">
        <TaskQuoteGateView
          title="Send quote"
          description="You've used this month's free tasks. Upgrade to quote more tasks. Quotes you've already sent stay editable."
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
      <Box minH="100dvh" bg="bg.subtle">
        <TaskQuoteGateView
          title="Verify your email"
          description="Verify your email before sending quotes. Check your inbox or resend from the banner."
          backHref={backToTask}
        >
          <TaskQuoteSummaryCard />
          <Link href="/verify-email/sent" _hover={{ textDecoration: 'none' }}>
            <Button w="full">Check inbox</Button>
          </Link>
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
            mt={6}
            px={0}
            loading={withdrawingQuote}
            onClick={() => void withdrawExistingQuote()}
          >
            <LuUndo2 />
            {t.actions.withdrawQuote}
          </Button>
        }
      />
    </Box>
  )
}
