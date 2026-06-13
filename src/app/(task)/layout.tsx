import { Box } from '@chakra-ui/react'

import { Dock, Header } from '@ui'

export default function TaskLayout({
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
        display="flex"
        flexDirection={{ base: 'column', md: 'row' }}
        minH={0}
        overflow="hidden"
      >
        <Box
          flex={1}
          minW={0}
          minH={0}
          overflowY="auto"
          position="relative"
          order={{ base: 1, md: 2 }}
        >
          {children}
        </Box>
        <Box
          flexShrink={0}
          order={{ base: 2, md: 1 }}
          w={{ base: 'full', md: 'auto' }}
        >
          <Dock />
        </Box>
      </Box>
    </Box>
  )
}
