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
      <Box as="main" flex={1} display="flex" minH={0} overflow="hidden">
        <Dock />
        <Box flex={1} minW={0} minH={0} overflowY="auto">
          {children}
        </Box>
      </Box>
    </Box>
  )
}
