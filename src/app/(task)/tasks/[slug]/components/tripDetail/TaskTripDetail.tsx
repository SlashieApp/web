'use client'

import { Box, Container, Grid } from '@chakra-ui/react'
import type { TaskQuery } from '@codegen/schema'

import { InfoBar } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import type { TaskDetailRecord } from '../../helpers/taskDetailUtils'
import { MapSnapshot } from './MapSnapshot'
import { Reveal } from './Reveal'
import { StateHero } from './StateHero'
import { StatusHeader } from './StatusHeader'
import { TaskActionsFooter } from './TaskActionsFooter'
import { TaskDetailAppBar } from './TaskDetailAppBar'
import { TaskDetailsAccordion } from './TaskDetailsAccordion'

type TaskTripDetailProps = {
  task: TaskDetailRecord
  order: NonNullable<TaskQuery['task']>['viewerOrder'] | null | undefined
}

const STICKY_TOP = 4

/**
 * Mobile-first, Uber-trip-style task detail. One vertical column on mobile/tablet;
 * on lg+ it splits into a primary column (status + hero + actions) and a sticky
 * secondary column (map + details) so wide screens are used fully.
 *
 * Workers evaluating an OPEN task get the task details first/expanded (they need
 * them to quote); owners and booked workers lead with the hero. Presentation only.
 */
export function TaskTripDetail({ task, order }: TaskTripDetailProps) {
  const { permissions } = useTaskDetail()

  // Quoting workers / visitors on an OPEN task read details before acting.
  const detailsFirst = !permissions.isOwner && permissions.isOpen

  return (
    <Container
      maxW="6xl"
      mx="auto"
      px={{ base: 4, md: 6 }}
      pt={{ base: 3, md: 5 }}
      pb={{ base: 28, md: 16 }}
    >
      <Grid
        templateColumns={{
          base: '1fr',
          lg: 'minmax(0, 1fr) minmax(320px, 380px)',
        }}
        columnGap={{ lg: 8 }}
        rowGap={5}
        alignItems="start"
      >
        <Box gridColumn={{ lg: '1 / -1' }} order={0}>
          <TaskDetailAppBar />
        </Box>

        <Box gridColumn={{ lg: '1' }} gridRow={{ lg: '2' }} order={1} minW={0}>
          <StatusHeader />
        </Box>

        {/* Side column (lg): map. On mobile it sits just under the header. */}
        <Box
          gridColumn={{ lg: '2' }}
          gridRow={{ lg: '2' }}
          order={2}
          position={{ lg: 'sticky' }}
          top={{ lg: STICKY_TOP }}
          alignSelf="start"
        >
          <MapSnapshot />
        </Box>

        {/* Side column (lg): details. Mobile order depends on the viewer. */}
        <Box
          gridColumn={{ lg: '2' }}
          gridRow={{ lg: '3' }}
          order={detailsFirst ? 3 : 5}
          position={{ lg: 'sticky' }}
          top={{ lg: STICKY_TOP }}
          alignSelf="start"
        >
          <TaskDetailsAccordion defaultOpen={detailsFirst} />
        </Box>

        <Box
          gridColumn={{ lg: '1' }}
          gridRow={{ lg: '3' }}
          order={detailsFirst ? 4 : 3}
          minW={0}
        >
          <StateHero order={order} />
        </Box>

        <Box gridColumn={{ lg: '1' }} gridRow={{ lg: '4' }} order={6} minW={0}>
          <Reveal>
            <InfoBar
              tone="info"
              icon={<PoundGlyph />}
              badgeLabel="Payments"
              heading="You pay the worker directly"
              linkLabel="How payments work"
              linkHref="#how-payments-work"
            >
              Slashie never handles job payment. Agree a price and pay your
              worker directly (cash, bank transfer, or card) - quotes and
              bookings happen here, money does not.
            </InfoBar>
          </Reveal>
        </Box>

        <Box gridColumn={{ lg: '1' }} gridRow={{ lg: '5' }} order={7} minW={0}>
          <TaskActionsFooter />
        </Box>
      </Grid>
    </Container>
  )
}

function PoundGlyph() {
  return <span aria-hidden>£</span>
}
