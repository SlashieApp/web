import { Box } from '@chakra-ui/react'

import { Header } from '@/ui/Header'

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
          order={{ base: 1, md: 2 }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}
