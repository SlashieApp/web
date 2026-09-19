'use client'

import { Box, Grid, Stack } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { SafetyNotice } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import {
  type TaskDetailSectionContext,
  type TaskDetailSectionId,
  isHiddenOnMobileWhilePinned,
  resolveStickySection,
  shouldShowInFlow,
} from '../../helpers/taskDetailSections'
import { useTaskDetailSectionContext } from '../../helpers/useTaskDetailSectionContext'
import { TaskOwnerCard } from '../TaskOwnerCard'
import { TaskActivitySections } from './TaskActivitySections'
import { TaskDetailStatusCallout } from './TaskDetailMoneyChrome'
import { TaskHelpActions } from './TaskOverflowMenu'
import { PhotosCard } from './openTask/PhotosCard'
import { QuotesPanel } from './openTask/QuotesPanel'
import { TaskDetailsCard } from './openTask/TaskDetailsCard'
import { TaskPricingCard } from './openTask/TaskPricingCard'
import { TrustCard } from './openTask/TrustCard'

function SectionGate({
  id,
  ctx,
  stickyId,
  children,
}: {
  id: TaskDetailSectionId
  ctx: TaskDetailSectionContext
  stickyId: ReturnType<typeof resolveStickySection>
  children: ReactNode
}) {
  if (!shouldShowInFlow(id, ctx)) return null
  const hideOnMobile = isHiddenOnMobileWhilePinned(id, stickyId)
  return (
    <Box
      display={hideOnMobile ? { base: 'none', lg: 'block' } : undefined}
      w="full"
      minW={0}
    >
      {children}
    </Box>
  )
}

/**
 * The two task-detail section groups, shared by both form factors as
 * Overview · Quotes tabs. Visibility and mobile pin eligibility come from
 * `taskDetailSections` — not ad-hoc role checks in this JSX.
 */

export function TaskInfoSections() {
  const { task } = useTaskDetail()
  const ctx = useTaskDetailSectionContext()
  const stickyId = resolveStickySection(ctx)

  return (
    <Stack gap={5} w="full" minW={0} pointerEvents="auto">
      <SectionGate id="statusCallout" ctx={ctx} stickyId={stickyId}>
        <TaskDetailStatusCallout />
      </SectionGate>
      <Grid
        templateColumns={{
          base: '1fr',
          lg: 'minmax(0, 1.85fr) minmax(280px, 1fr)',
        }}
        gap={6}
        alignItems="start"
      >
        <Stack gap={5} minW={0}>
          <SectionGate id="pricingQuote" ctx={ctx} stickyId={stickyId}>
            <TaskPricingCard />
          </SectionGate>
          <SectionGate id="details" ctx={ctx} stickyId={stickyId}>
            <TaskDetailsCard />
          </SectionGate>
          <SectionGate id="photos" ctx={ctx} stickyId={stickyId}>
            <PhotosCard />
          </SectionGate>
        </Stack>
        <Stack gap={5} minW={0}>
          <SectionGate id="helpActions" ctx={ctx} stickyId={stickyId}>
            <TaskHelpActions />
          </SectionGate>
          <SectionGate id="activity" ctx={ctx} stickyId={stickyId}>
            <TaskActivitySections />
          </SectionGate>
          <SectionGate id="ownerContact" ctx={ctx} stickyId={stickyId}>
            <TaskOwnerCard />
          </SectionGate>
        </Stack>
      </Grid>
      {task ? (
        <Box display={{ base: 'none', lg: 'block' }}>
          <SafetyNotice variant="inline" />
        </Box>
      ) : null}
    </Stack>
  )
}

export function TaskQuoteSections() {
  return (
    <Stack gap={5} w="full" minW={0} pointerEvents="auto">
      <QuotesPanel />
      <TrustCard />
    </Stack>
  )
}
