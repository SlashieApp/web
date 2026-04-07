import { Box } from '@chakra-ui/react'

import { TaskBrowse } from '@/app/components'
import { Header } from '@ui'

export default function HomePage() {
  return (
    <Box
      bg="surface"
      color="fg"
      display="flex"
      flexDirection="column"
      position="relative"
    >
      <Header float />
      <TaskBrowse layout="mapHero" />
    </Box>
  )
}
