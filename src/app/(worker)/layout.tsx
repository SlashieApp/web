import { Box } from '@chakra-ui/react'

import { Header } from '@/ui/Header'
import {
  MOBILE_BOTTOM_NAV_CLEARANCE,
  MobileBottomNav,
} from '@/ui/MobileBottomNav'

export default function WorkerLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <Box display="flex" flexDirection="column" height="100dvh">
      <Header />
      <Box
        as="main"
        flex={1}
        minH={0}
        overflowY="auto"
        pb={{ base: MOBILE_BOTTOM_NAV_CLEARANCE, md: 0 }}
      >
        {children}
      </Box>
      <MobileBottomNav />
    </Box>
  )
}
