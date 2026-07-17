'use client'

import { Box, Grid, Stack } from '@chakra-ui/react'

import { Button, Link } from '@ui'

import { DashboardPageLayout } from '@/app/(dashboard)/components/DashboardPageLayout'

import { useMyRequestsPage } from '../context/MyRequestsProvider'

import { MyRequestsFilterColumn } from './MyRequestsFilterColumn'
import { MyRequestsMainColumn } from './MyRequestsMainColumn'
import { PostedTaskActivity } from './PostedTaskActivity'
import { PostedTaskCalendar } from './PostedTaskCalendar'
import { PostedTaskFilters } from './PostedTaskFilters'
import { PostedTaskQuickStats } from './PostedTaskQuickStats'
import { PostedTaskUpcoming } from './PostedTaskUpcoming'

export function MyRequestsLayout() {
  const { taskRows } = useMyRequestsPage()

  return (
    <DashboardPageLayout
      eyebrow="REQUESTS"
      title="My requests"
      description="Track posted tasks, incoming quotes, and bookings in one place."
      actions={
        <Link href="/tasks/create" _hover={{ textDecoration: 'none' }}>
          <Button size="sm">Post a task</Button>
        </Link>
      }
    >
      <Grid
        w="full"
        templateColumns={{
          base: 'minmax(0, 1fr)',
          md: 'minmax(0, 1fr) minmax(280px, 340px)',
          '2xl': 'minmax(220px, 300px) minmax(0, 1fr) minmax(280px, 340px)',
        }}
        gap={{ base: 6, md: 8, '2xl': 8 }}
        alignItems="start"
      >
        <Box
          minW={0}
          gridColumn={{ base: '1', md: '1', '2xl': '2' }}
          gridRow={{ base: '1', md: '1', '2xl': '1' }}
        >
          <MyRequestsMainColumn />
        </Box>

        <Box
          display={{ base: 'contents', md: 'flex', '2xl': 'contents' }}
          flexDirection="column"
          gap={4}
          w={{ md: 'full' }}
          gridColumn={{ md: '2' }}
          gridRow={{ md: '1 / 3' }}
          position={{ md: 'sticky' }}
          top={{ md: 6 }}
          alignSelf="start"
        >
          <Stack
            gap={4}
            minW={0}
            w="full"
            gridColumn={{ base: '1', '2xl': '1' }}
            gridRow={{ base: '2', '2xl': '1' }}
            position={{ base: 'static', '2xl': 'sticky' }}
            top={{ '2xl': 6 }}
            alignSelf="start"
          >
            {taskRows.length > 0 ? <PostedTaskQuickStats /> : null}
            {taskRows.length > 0 ? <PostedTaskCalendar /> : null}
            {taskRows.length > 0 ? (
              <Box display={{ base: 'block', md: 'none' }}>
                <PostedTaskFilters />
              </Box>
            ) : null}
            <Box display={{ base: 'none', md: 'block' }}>
              <MyRequestsFilterColumn />
            </Box>
          </Stack>

          <Stack
            gap={4}
            minW={0}
            w="full"
            gridColumn={{ base: '1', '2xl': '3' }}
            gridRow={{ base: '3', '2xl': '1' }}
            position={{ base: 'static', '2xl': 'sticky' }}
            top={{ '2xl': 6 }}
            alignSelf="start"
          >
            {taskRows.length > 0 ? <PostedTaskUpcoming /> : null}
            <PostedTaskActivity />
          </Stack>
        </Box>
      </Grid>
    </DashboardPageLayout>
  )
}
