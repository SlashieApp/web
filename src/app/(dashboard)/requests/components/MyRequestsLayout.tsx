'use client'

import { Box, Grid, Stack } from '@chakra-ui/react'

import { useMyRequestsPage } from '../context/MyRequestsProvider'

import { MyRequestsFilterColumn } from './MyRequestsFilterColumn'
import { MyRequestsMainColumn } from './MyRequestsMainColumn'
import { MyRequestsScheduleColumn } from './MyRequestsScheduleColumn'
import { PostedTaskQuickStats } from './PostedTaskQuickStats'

export function MyRequestsLayout() {
  const { taskRows } = useMyRequestsPage()

  return (
    <Grid
      templateColumns={{ base: '1fr', xl: '240px minmax(0, 1fr) 300px' }}
      gap={{ base: 6, xl: 6 }}
      alignItems="start"
    >
      <Box display={{ base: 'none', xl: 'block' }} minW={0}>
        <Stack gap={4} position="sticky" top={6}>
          {taskRows.length > 0 ? <PostedTaskQuickStats /> : null}
          <MyRequestsFilterColumn />
        </Stack>
      </Box>

      <MyRequestsMainColumn />

      {taskRows.length > 0 ? <MyRequestsScheduleColumn /> : null}
    </Grid>
  )
}
