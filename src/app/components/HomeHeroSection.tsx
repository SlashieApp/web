'use client'

import { Box, Grid, HStack, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'

import { Badge, Button, GlassCard, Heading, Text } from '@ui'

function MiniAvatar({ label }: { label: string }) {
  return (
    <Box
      w="28px"
      h="28px"
      borderRadius="full"
      bg="linear-gradient(140deg, #003fb1, #1a56db)"
      color="white"
      fontSize="xs"
      fontWeight={700}
      display="flex"
      alignItems="center"
      justifyContent="center"
      boxShadow="ambient"
    >
      {label}
    </Box>
  )
}

export function HomeHeroSection() {
  return (
    <Grid templateColumns={{ base: '1fr', lg: '1.15fr 0.85fr' }} gap={10}>
      <Stack gap={6}>
        <Badge alignSelf="flex-start" px={3}>
          Vetted professionals only
        </Badge>

        <Heading size={{ base: '4xl', md: '5xl' }} lineHeight={1.04}>
          Fix, Build, and
          <br />
          Maintain Your Home
          <br />
          with <Box as="span" color="primary.600">HandyBox.</Box>
        </Heading>

        <Text color="muted" fontSize="lg" maxW="2xl">
          Post a job, get offers, and book a vetted handyman in minutes.
          Experience the architectural precision of master craftsmanship at your
          doorstep.
        </Text>

        <HStack gap={3} flexWrap="wrap">
          <Button as={NextLink} href="/tasks/create" size="lg">
            Post a Job
          </Button>
          <Button
            as={NextLink}
            href="/tasks"
            variant="subtle"
            bg="surfaceContainerLowest"
            size="lg"
          >
            Browse Services
          </Button>
        </HStack>

        <HStack gap={3} pt={1}>
          <HStack gap={-2}>
            <MiniAvatar label="A" />
            <MiniAvatar label="M" />
            <MiniAvatar label="J" />
            <Box
              px={2}
              py={1}
              borderRadius="full"
              bg="secondaryFixed"
              color="onSecondaryFixed"
              fontSize="10px"
              fontWeight={700}
            >
              +2k
            </Box>
          </HStack>
          <Text fontSize="sm" color="muted">
            Trusted by <Box as="span" color="fg" fontWeight={700}>2,000+</Box>{' '}
            homeowners this month
          </Text>
        </HStack>
      </Stack>

      <Box position="relative">
        <GlassCard bg="secondaryFixed" borderRadius="2xl" p={6} minH="430px">
          <Box
            h="100%"
            borderRadius="xl"
            bg="linear-gradient(180deg, rgba(254,166,25,0.15), rgba(0,63,177,0.08))"
            display="flex"
            alignItems="center"
            justifyContent="center"
            position="relative"
          >
            <Box textAlign="center">
              <Text fontSize="7xl">🧰</Text>
              <Text fontWeight={700}>Master Craftsman</Text>
            </Box>
          </Box>
        </GlassCard>

        <GlassCard
          position="absolute"
          left={{ base: 4, md: 6 }}
          bottom={{ base: -4, md: -6 }}
          bg="surfaceContainerLowest"
          p={3}
          borderRadius="xl"
          boxShadow="ambient"
        >
          <HStack gap={2}>
            <Box
              w="28px"
              h="28px"
              borderRadius="full"
              bg="secondaryContainer"
              display="grid"
              placeItems="center"
              fontSize="sm"
            >
              ★
            </Box>
            <Stack gap={0}>
              <Text fontSize="xs" fontWeight={700}>
                Top-Rated Pros
              </Text>
              <Text fontSize="xs" color="muted">
                Vetted &amp; Insured
              </Text>
            </Stack>
          </HStack>
        </GlassCard>
      </Box>
    </Grid>
  )
}
