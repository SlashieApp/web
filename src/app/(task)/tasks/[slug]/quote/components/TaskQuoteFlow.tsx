'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useRef } from 'react'

import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import { workerSetupHref } from '@/app/(worker)/worker/setup/helpers/workerSetupHref'
import { Box, Stack, Text } from '@chakra-ui/react'

import { Button, Link } from '@ui'

import { QuoteLimitPaywall } from '../../components/quoteSection/QuoteLimitPaywall'
import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TaskQuoteGateView } from './TaskQuoteGateView'
import { TaskQuoteScreen } from './TaskQuoteScreen'
import { TaskQuoteSummaryCard } from './TaskQuoteSummaryCard'

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
  } = useTaskDetail()

  const redirectedRef = useRef(false)

  const { isOwner, hasWorkerProfile, showQuoteForm } = permissions

  const backToTask = task ? taskDetailHref(task.id) : '/tasks'

  const shouldRedirectToTaskDetail = Boolean(
    task &&
      !quoteSuccess &&
      (isOwner ||
        myQuote ||
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

  if (!task) return null

  const loginHref = `/login?next=${encodeURIComponent(`${backToTask}/quote`)}`

  if (isAuthenticated && meLoading) {
    return (
      <Box ref={redirectToTaskDetailRef} minH="100dvh" bg="bg.subtle">
        <Stack py={10} align="center">
          <Text color="text.muted">Loading…</Text>
        </Stack>
      </Box>
    )
  }

  if (shouldRedirectToTaskDetail) {
    return (
      <Box ref={redirectToTaskDetailRef} minH="100dvh" bg="bg.subtle">
        <Stack py={10} align="center">
          <Text color="text.muted">Redirecting…</Text>
        </Stack>
      </Box>
    )
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

  if (quoteLimitReached) {
    return (
      <Box minH="100dvh" bg="bg.subtle">
        <TaskQuoteGateView
          title="Send quote"
          description="Upgrade to send more quotes this month."
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

  return (
    <Box>
      <TaskQuoteScreen backToTask={backToTask} />
    </Box>
  )
}
