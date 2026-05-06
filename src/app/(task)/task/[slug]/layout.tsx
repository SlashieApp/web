import { Box, Container, Stack, Text } from '@chakra-ui/react'

import { Footer, SectionCard } from '@ui'

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
  const task = await getTaskForTaskDetailPage(slug)
  console.log(task)

  if (!task) {
    return (
      <Box bg="bg" color="cardFg" minH="100vh">
        <Stack gap={0}>
          <Box as="section" py={{ base: 8, md: 10 }}>
            <Container>
              <Stack gap={8} maxW="7xl" mx="auto" px={{ base: 4, md: 6 }}>
                <SectionCard eyebrow="Task" heading="Unavailable">
                  <Text color="formLabelMuted">
                    Task details are unavailable.
                  </Text>
                </SectionCard>
              </Stack>
            </Container>
          </Box>
          <Footer />
        </Stack>
      </Box>
    )
  }

  return (
    <TaskDetailProvider taskId={slug} initialTask={task}>
      {children}
    </TaskDetailProvider>
  )
}
