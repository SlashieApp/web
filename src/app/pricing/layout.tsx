import { Box } from '@chakra-ui/react'

import { Header } from '@ui'

export default function PricingLayout({
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
      <Header />
      <Box as="main" flex={1}>
        {children}
      </Box>
    </Box>
  )
}
