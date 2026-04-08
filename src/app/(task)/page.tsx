'use client'
import { useBreakpointValue } from '@chakra-ui/react'

import { MobileLayout } from './components/(mobile)/MobileLayout'
import { WebLayout } from './components/(web)/WebLayout'
import { TaskBrowseProvider } from './context/TaskBrowseProvider'

export default function HomePage() {
  const isDesktopSplit =
    useBreakpointValue({ base: false, md: true }, { fallback: 'base' }) ?? false

  return (
    <TaskBrowseProvider initialTasks={[]} isDesktop={isDesktopSplit}>
      {isDesktopSplit ? <WebLayout /> : <MobileLayout />}
    </TaskBrowseProvider>
  )
}
