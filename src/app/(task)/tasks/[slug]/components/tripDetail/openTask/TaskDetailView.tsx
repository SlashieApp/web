'use client'

import type { OrderItem } from '@/utils/orderHelpers'
import { Box, Grid, Stack } from '@chakra-ui/react'

import { useTaskDetail } from '../../../context/TaskDetailProvider'
import { TaskOwnerCard } from '../../TaskOwnerCard'
import { BookingSection } from './BookingSection'
import { HelpActionsCard } from './HelpActionsCard'
import { LocationCard } from './LocationCard'
import { OpenTaskHeader } from './OpenTaskHeader'
import { PhotosCard } from './PhotosCard'
import { QuotesPanel } from './QuotesPanel'
import { TaskDetailsCard } from './TaskDetailsCard'
import { TrustCard } from './TrustCard'

type TaskDetailViewProps = {
  order: OrderItem | null | undefined
}

/**
 * Single desktop layout for a task detail, used for EVERY status (open, awarded
 * "job in progress", closed, cancelled). Each section branches on `permissions`
 * internally; `StatePanel` swaps the primary content per state. Desktop-only —
 * mobile is handled by `TaskDetailMobile`.
 */
export function TaskDetailView({ order }: TaskDetailViewProps) {
  const { permissions } = useTaskDetail()

  return (
    <Box
      maxW="6xl"
      mx="auto"
      px={{ base: 4, md: 6 }}
      pt={{ base: 3, md: 5 }}
      pb={{ base: 28, md: 16 }}
    >
      <Stack gap={5} w="full">
        <OpenTaskHeader />

        <Grid
          templateColumns={{
            base: '1fr',
            lg: 'minmax(0, 1fr) minmax(320px, 400px)',
          }}
          columnGap={{ lg: 8 }}
          rowGap={5}
          alignItems="start"
        >
          {/* Left column */}
          <Stack gap={5} minW={0}>
            {/* "Your booking" section (active order / closed); null otherwise. */}
            <BookingSection order={order} />
            <TaskDetailsCard />
            {permissions.isOwner ? null : <TaskOwnerCard />}
            <PhotosCard />
            <TrustCard />
            <HelpActionsCard />
          </Stack>

          {/* Right column — quotes stay visible across states (shows the
              selected quote once awarded). */}
          <Stack gap={5} minW={0}>
            <LocationCard />
            <QuotesPanel />
          </Stack>
        </Grid>
      </Stack>
    </Box>
  )
}
