import { Box } from '@chakra-ui/react'

import { TaskBrowse } from '@/app/(task)/components'
import { Footer, Header } from '@ui'

export default function HomePage() {
  return (
    <Box
      bg="surface"
      color="fg"
      display="flex"
      flexDirection="column"
      position="relative"
    >
      <Header />
      <TaskBrowse />
      {/* <Footer /> */}
    </Box>
  )
}
