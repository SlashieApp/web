import { Box, Container, Stack, Text } from '@chakra-ui/react'

import { Card, Footer } from '@ui'

import { TaskNotFoundTracker } from './TaskNotFoundTracker'

/** Full-page "task not found" state, rendered by the detail + quote pages. */
export function TaskNotFoundCard() {
  return (
    <Box bg="bg.canvas" color="text.default" minH="100vh">
      <Stack gap={0}>
        <Box as="section" py={{ base: 8, md: 10 }}>
          <Container>
            <Stack gap={8} maxW="7xl" mx="auto" px={{ base: 4, md: 6 }}>
              <Card layout="section" eyebrow="Task" heading="Task not found">
                <TaskNotFoundTracker />
                <Text color="text.muted">
                  This task is not available. It may have been removed or you do
                  not have access to view it.
                </Text>
              </Card>
            </Stack>
          </Container>
        </Box>
        <Footer />
      </Stack>
    </Box>
  )
}
