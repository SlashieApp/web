import { Box } from '@chakra-ui/react'

import { MarketingHeader } from './components/MarketingHeader'

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <Box
      bg="bg.subtle"
      color="text.default"
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
