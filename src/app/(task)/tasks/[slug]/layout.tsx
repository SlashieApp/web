import { Box, Container, Stack, Text } from '@chakra-ui/react'

import { Card, Footer } from '@ui'

import { TaskNotFoundTracker } from './components/TaskNotFoundTracker'
import { TaskDetailProvider } from './context/TaskDetailProvider'
import { getTaskForTaskDetailPage } from './helpers/getTaskForTaskDetailPage'

export default async function TaskSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { task, order } = await getTaskForTaskDetailPage(slug)

  if (!task) {
    return (
      <Box bg="bg" color="cardFg" minH="100vh">
        <Stack gap={0}>
          <Box as="section" py={{ base: 8, md: 10 }}>
            <Container>
              <Stack gap={8} maxW="7xl" mx="auto" px={{ base: 4, md: 6 }}>
                <Card layout="section" eyebrow="Task" heading="Task not found">
                  <TaskNotFoundTracker />
                  <Text color="formLabelMuted">
                    This task is not available. It may have been removed or you
                    do not have access to view it.
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

  return (
    <TaskDetailProvider taskId={slug} initialTask={task} initialOrder={order}>
      {children}
    </TaskDetailProvider>
  )
}
