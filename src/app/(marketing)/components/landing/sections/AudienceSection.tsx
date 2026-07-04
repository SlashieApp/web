import {
  Box,
  Container,
  Grid,
  HStack,
  Heading,
  List,
  Stack,
  Text,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import type { ReactNode } from 'react'
import { LuCheck, LuUsers, LuWrench } from 'react-icons/lu'

import { Button } from '@ui'

import { Reveal } from '../Reveal'

/** Green check chip — dark ink on the green fill (green-ink rule). */
function CheckChip() {
  return (
    <Box
      as="span"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      boxSize="20px"
      borderRadius="full"
      bg="action.primary"
      color="text.onGreen"
      flexShrink={0}
      mt="2px"
      aria-hidden
    >
      <LuCheck size={12} strokeWidth={3} />
    </Box>
  )
}

function AudienceCard({
  title,
  icon,
  items,
  ctaLabel,
  href,
  featured = false,
}: {
  title: string
  icon: ReactNode
  items: readonly string[]
  ctaLabel: string
  href: string
  featured?: boolean
}) {
  return (
    <Stack
      gap={6}
      h="full"
      p={{ base: 5, md: 7 }}
      bg="bg.surface"
      borderRadius="2xl"
      borderWidth={featured ? '2px' : '1px'}
      borderColor={featured ? 'border.focus' : 'border.default'}
      boxShadow="e2"
    >
      <HStack gap={3} align="center">
        <Box
          boxSize="44px"
          borderRadius="full"
          bg="status.success.soft"
          color="status.success.fg"
          display="flex"
          alignItems="center"
          justifyContent="center"
          aria-hidden
        >
          {icon}
        </Box>
        <Heading as="h3" fontSize="20px" fontWeight={600}>
          {title}
        </Heading>
      </HStack>
      <List.Root gap={3} ps={0} style={{ listStyle: 'none' }}>
        {items.map((item) => (
          <List.Item key={item} display="flex" gap={3} alignItems="flex-start">
            <CheckChip />
            <Text fontSize="sm" color="text.default" lineHeight="tall">
              {item}
            </Text>
          </List.Item>
        ))}
      </List.Root>
      <NextLink href={href} style={{ textDecoration: 'none' }}>
        <Button w="fit-content" variant={featured ? 'primary' : 'secondary'}>
          {ctaLabel}
        </Button>
      </NextLink>
    </Stack>
  )
}

export function AudienceSection() {
  return (
    <Box as="section" bg="bg.subtle" py={{ base: 16, md: 24 }}>
      <Container maxW="6xl" px={{ base: 4, md: 6 }}>
        <Stack gap={{ base: 10, md: 14 }}>
          <Reveal>
            <Heading
              as="h2"
              fontFamily="display"
              fontSize={{ base: '28px', md: '36px' }}
              letterSpacing="-0.01em"
              textAlign="center"
            >
              Built for customers and workers
            </Heading>
          </Reveal>
          <Grid
            templateColumns={{ base: '1fr', md: '1fr 1fr' }}
            gap={6}
            alignItems="stretch"
          >
            <Reveal h="full">
              <AudienceCard
                title="For customers"
                icon={<LuUsers size={22} />}
                items={[
                  'Post tasks for free — no platform fee on the job',
                  'Compare multiple quotes from nearby workers',
                  'Choose by price, profile, and reviews',
                ]}
                ctaLabel="Post a task"
                href="/tasks/create"
              />
            </Reveal>
            <Reveal delayMs={120} h="full">
              <AudienceCard
                title="For workers"
                icon={<LuWrench size={22} />}
                featured
                items={[
                  'See real local demand on the map',
                  'Send quotes and win work nearby',
                  'Keep 100% of the job price — subscription for access',
                ]}
                ctaLabel="Become a worker"
                href="/register"
              />
            </Reveal>
          </Grid>
        </Stack>
      </Container>
    </Box>
  )
}
