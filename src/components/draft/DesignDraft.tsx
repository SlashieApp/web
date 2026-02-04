'use client'

import {
  Box,
  Container,
  Grid,
  Heading,
  Stack,
  Text,
  Badge,
  HStack,
  SimpleGrid,
} from '@chakra-ui/react'

import { GlassCard, TextInput, UiButton } from '@/components/ui'

export function DesignDraft() {
  return (
    <Box bg="bg" color="fg" minH="100vh" py={{ base: 10, md: 16 }}>
      <Container maxW="6xl">
        <Stack gap={10}>
          <HStack justify="space-between" align="center">
            <HStack gap={3}>
              <Box
                w="36px"
                h="36px"
                borderRadius="12px"
                bg="mustard.400"
              />
              <Heading size="md">HandyBox</Heading>
            </HStack>
            <HStack gap={3}>
              <UiButton variant="ghost">Log in</UiButton>
              <UiButton background="linkBlue.600" color="white">
                Post a job
              </UiButton>
            </HStack>
          </HStack>

          <Grid
            templateColumns={{ base: '1fr', md: '1.1fr 0.9fr' }}
            gap={8}
            alignItems="center"
          >
            <Stack gap={5}>
              <Badge
                alignSelf="flex-start"
                bg="mustard.200"
                color="black"
                px={3}
                py={1}
                borderRadius="999px"
                fontWeight={600}
              >
                Local trades, sorted
              </Badge>
              <Heading size={{ base: '2xl', md: '3xl' }}>
                Book trusted local handymen in minutes.
              </Heading>
              <Text color="muted" fontSize="lg">
                Post a job, get quotes, and book a vetted handyman. HandyBox keeps
                your job details, messages, and updates in one place.
              </Text>
              <HStack gap={3} flexWrap="wrap">
                <UiButton background="linkBlue.600" color="white">
                  Get started
                </UiButton>
                <UiButton variant="outline" borderColor="border">
                  Browse jobs
                </UiButton>
              </HStack>
            </Stack>

            <GlassCard p={6}>
              <Stack gap={4}>
                <Heading size="md">Post a quick job</Heading>
                <TextInput placeholder="Job title (e.g. Mount TV)" />
                <TextInput placeholder="Location" />
                <TextInput placeholder="Details" />
                <UiButton background="mustard.500" color="black">
                  Submit job
                </UiButton>
              </Stack>
            </GlassCard>
          </Grid>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
            {[
              {
                title: 'Post in minutes',
                body: 'Share a small job with photos, location, and timing.'
              },
              {
                title: 'Get clear quotes',
                body: 'Handymen reply with availability and upfront pricing.'
              },
              {
                title: 'Book with confidence',
                body: 'Pick the best fit and keep everything in one thread.'
              }
            ].map((card) => (
              <GlassCard key={card.title} p={5}>
                <Heading size="sm" mb={2}>
                  {card.title}
                </Heading>
                <Text color="muted">{card.body}</Text>
              </GlassCard>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  )
}
