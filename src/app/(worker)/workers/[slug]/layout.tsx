import { Box, Container, Stack, Text } from '@chakra-ui/react'

import { Footer, SectionCard } from '@ui'

import { WorkerProfileProvider } from './context/WorkerProfileContext'
import { getWorkerForPublicPage } from './helpers/getWorkerForPublicPage'

export default async function WorkerProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { worker } = await getWorkerForPublicPage(slug)

  if (!worker) {
    return (
      <>
        <Box as="section" py={{ base: 8, md: 10 }}>
          <Container>
            <Stack gap={8} maxW="3xl" mx="auto" px={{ base: 4, md: 6 }}>
              <SectionCard eyebrow="Worker" heading="Worker not found">
                <Text color="formLabelMuted">
                  This worker profile is not available. It may have been removed
                  or the link may be incorrect.
                </Text>
              </SectionCard>
            </Stack>
          </Container>
        </Box>
        <Footer />
      </>
    )
  }

  return (
    <WorkerProfileProvider worker={worker}>{children}</WorkerProfileProvider>
  )
}
