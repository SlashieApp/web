import { Box } from '@chakra-ui/react'

import { MAIN_CONTENT_ID } from '@/ui/SkipLink/mainContent'
import { MarketingHeader } from './components/layout/MarketingHeader'

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <Box
      bg="bg.canvas"
      color="text.default"
      minH="100dvh"
      display="flex"
      flexDirection="column"
    >
      {/* MarketingHeader renders the keyboard skip link (-> #main-content)
          as the page's first tab stop. */}
      <MarketingHeader />
      {/* No `mx="auto"`: an auto cross-axis margin stops flex stretching and
          collapses main to max-content width, breaking full-bleed sections. */}
      <Box
        as="main"
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        _focusVisible={{ outline: 'none' }}
        flex={1}
        w="full"
        minW={0}
        overflowX="clip"
      >
        {children}
      </Box>
    </Box>
  )
}
