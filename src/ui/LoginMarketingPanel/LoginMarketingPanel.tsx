'use client'

import type { ReactNode } from 'react'

import { Box, HStack, Stack } from '@chakra-ui/react'

import { Badge } from '../Badge'
import { Heading } from '../Typography'
import { Text } from '../Typography'

function StatCard({ children }: { children: ReactNode }) {
  return (
    <Stack
      gap={1}
      flex={1}
      minW={0}
      borderRadius="lg"
      px={{ base: 4, md: 5 }}
      py={4}
      bg="rgba(255, 255, 255, 0.08)"
      borderWidth="1px"
      borderColor="rgba(255, 255, 255, 0.14)"
      backdropFilter="blur(10px)"
    >
      {children}
    </Stack>
  )
}

export function LoginMarketingPanel() {
  return (
    <Box
      position="relative"
      overflow="hidden"
      display={{ base: 'none', lg: 'flex' }}
      flexDirection="column"
      justifyContent="space-between"
      minH="100vh"
      px={{ lg: 10, xl: 14 }}
      py={{ lg: 12, xl: 14 }}
      bg="primary.800"
      color="white"
    >
      <Box
        position="absolute"
        inset={0}
        opacity={0.22}
        bgImage="repeating-linear-gradient(0deg, transparent, transparent 47px, rgba(255,255,255,0.06) 47px, rgba(255,255,255,0.06) 48px), repeating-linear-gradient(90deg, transparent, transparent 47px, rgba(255,255,255,0.06) 47px, rgba(255,255,255,0.06) 48px)"
        pointerEvents="none"
        aria-hidden
      />
      <Box
        position="absolute"
        inset={0}
        opacity={0.12}
        bgImage="linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 42%, transparent 58%, rgba(0,0,0,0.2) 100%)"
        pointerEvents="none"
        aria-hidden
      />

      <Stack gap={8} position="relative" zIndex={1} maxW="lg">
        <Badge
          alignSelf="flex-start"
          bg="secondary.300"
          color="secondary.900"
          fontSize="2xs"
          letterSpacing="0.08em"
          textTransform="uppercase"
          py={1.5}
          px={3}
          display="inline-flex"
          alignItems="center"
          gap={2}
        >
          <Box
            as="span"
            display="inline-block"
            w={3.5}
            h={3.5}
            borderRadius="full"
            bg="secondary.600"
            boxShadow="inset 0 0 0 1px rgba(255,255,255,0.25)"
            aria-hidden
          />
          Master craftsman quality
        </Badge>

        <Box>
          <Heading
            as="h1"
            fontSize={{ lg: '4xl', xl: '5xl' }}
            lineHeight="1.1"
            fontWeight={800}
            color="white"
            letterSpacing="-0.03em"
          >
            Building tools for those who{' '}
            <Box
              as="span"
              bg="#f5d547"
              color="primary.900"
              px={1.5}
              py={0.5}
              borderRadius="md"
            >
              build the world.
            </Box>
          </Heading>
          <Text
            mt={5}
            fontSize="lg"
            lineHeight="1.55"
            color="rgba(255, 255, 255, 0.88)"
            fontWeight={500}
          >
            Manage your projects, handle bookings, and scale your business with
            the precision of a master craftsman. HandyBox is your digital
            toolbox.
          </Text>
        </Box>
      </Stack>

      <HStack
        gap={4}
        align="stretch"
        position="relative"
        zIndex={1}
        w="full"
        maxW="lg"
        mt={{ lg: 12 }}
      >
        <StatCard>
          <Text fontSize="3xl" fontWeight={800} lineHeight="1" color="white">
            12k+
          </Text>
          <Text
            fontSize="xs"
            fontWeight={700}
            letterSpacing="0.1em"
            color="rgba(255, 255, 255, 0.75)"
            textTransform="uppercase"
          >
            Active pros
          </Text>
        </StatCard>
        <StatCard>
          <Text fontSize="3xl" fontWeight={800} lineHeight="1" color="white">
            98%
          </Text>
          <Text
            fontSize="xs"
            fontWeight={700}
            letterSpacing="0.1em"
            color="rgba(255, 255, 255, 0.75)"
            textTransform="uppercase"
          >
            Job success
          </Text>
        </StatCard>
      </HStack>
    </Box>
  )
}
