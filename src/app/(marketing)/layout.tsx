import { Box } from '@chakra-ui/react'

import { MarketingHeader } from './components/MarketingHeader'

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <Box
      bg="neutral.100"
      color="cardFg"
      minH="100dvh"
      display="flex"
      flexDirection="column"
    >
      <MarketingHeader />
      <Box as="main" flex={1} mx="auto">
        {children}
      </Box>
    </Box>
  )
}
