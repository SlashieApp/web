'use client'
import { Box, useBreakpointValue } from '@chakra-ui/react'

import { MobileLayout } from './components/(mobile)/MobileLayout'
import { WebLayout } from './components/(web)/WebLayout'
import { TaskBrowseMapLayer } from './components/TaskMap'
import { TaskBrowseProvider } from './context/TaskBrowseProvider'

export default function HomePage() {
  const isDesktopSplit =
    useBreakpointValue({ base: false, md: true }, { fallback: 'base' }) ?? false

  return (
    <TaskBrowseProvider initialTasks={[]} isDesktop={isDesktopSplit}>
      <Box
        flex={1}
        minH={0}
        w="full"
        minW={0}
        position="relative"
        display="flex"
        flexDirection="column"
      >
        <TaskBrowseMapLayer isDesktop={isDesktopSplit} />
        {isDesktopSplit ? <WebLayout /> : <MobileLayout />}
      </Box>
    </TaskBrowseProvider>
  )
}
