'use client'

import { Stack } from '@chakra-ui/react'

import { PostedTaskCalendar } from './PostedTaskCalendar'
import { PostedTaskUpcoming } from './PostedTaskUpcoming'

export function MyRequestsScheduleColumn() {
  return (
    <Stack
      gap={4}
      position={{ xl: 'sticky' }}
      top={{ xl: 6 }}
      alignSelf="start"
      w="full"
      minW={0}
    >
      <PostedTaskCalendar />
      <PostedTaskUpcoming />
    </Stack>
  )
}
