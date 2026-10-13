import { Box, Container, Stack, Text } from '@chakra-ui/react'

import { APP_HOME } from '@/utils/appRoutes'
import { Button, Card, Footer, Link } from '@ui'

import { TaskNotFoundTracker } from '../analytics/TaskNotFoundTracker'

/** Full-page "task not found" state, rendered by the detail + quote pages. */
export function TaskNotFoundCard({
  eyebrow,
  heading = 'Task not found',
  description = 'This task is not available. It may have been removed or you do not have access to view it.',
  browseLabel = 'Search tasks',
}: {
  eyebrow?: string
  heading?: string
  description?: string
  /** Way out to search; this route has no header or bottom nav. */
  browseLabel?: string
}) {
  return (
    <Box bg="bg.canvas" color="text.default" minH="100dvh">
      <Stack gap={0}>
        <Box as="section" py={{ base: 8, md: 10 }}>
          <Container>
            <Stack gap={8}>
              <Card layout="section" eyebrow={eyebrow} heading={heading}>
                <TaskNotFoundTracker />
                <Text color="text.muted">{description}</Text>
                <Button
                  asChild
                  variant="secondary"
                  alignSelf="flex-start"
                  mt={4}
                >
                  <Link href={APP_HOME} _hover={{ textDecoration: 'none' }}>
                    {browseLabel}
                  </Link>
                </Button>
              </Card>
            </Stack>
          </Container>
        </Box>
        <Footer />
      </Stack>
    </Box>
  )
}
