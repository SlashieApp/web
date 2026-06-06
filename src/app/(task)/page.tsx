'use client'
import { Box, useBreakpointValue } from '@chakra-ui/react'
import { useCallback, useRef } from 'react'

import { EVENTS, capture } from '@/lib/analytics'

import { MobileLayout } from './components/(mobile)/MobileLayout'
import { WebLayout } from './components/(web)/WebLayout'
import { BrowseGeolocationInit } from './components/BrowseGeolocationInit'
import { TaskBrowseMapLoader } from './components/TaskBrowseMapLoader'
import { TaskBrowseMapLayer } from './components/TaskMap'
import { TaskBrowseProvider } from './context/TaskBrowseProvider'

export default function HomePage() {
  const isDesktopSplit =
    useBreakpointValue({ base: false, lg: true }, { fallback: 'base' }) ?? false
  const browseTrackedRef = useRef(false)

  const onBrowseMountRef = useCallback((node: HTMLDivElement | null) => {
    if (!node || browseTrackedRef.current) return
    browseTrackedRef.current = true
    capture(EVENTS.browse_view)
  }, [])

  return (
    <TaskBrowseProvider initialTasks={[]} isDesktop={isDesktopSplit}>
      <BrowseGeolocationInit />
      <Box
        ref={onBrowseMountRef}
        flex={1}
        height="100%"
        w="full"
        minW={0}
        minH={0}
        position="relative"
        display="flex"
        flexDirection="column"
        overflow="hidden"
      >
        <TaskBrowseMapLayer isDesktop={isDesktopSplit} />
        <TaskBrowseMapLoader />
        {isDesktopSplit ? <WebLayout /> : <MobileLayout />}
      </Box>
    </TaskBrowseProvider>
  )
}
