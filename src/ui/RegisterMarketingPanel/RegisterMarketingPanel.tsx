'use client'

import type { ReactNode } from 'react'

import { Box, HStack, Stack } from '@chakra-ui/react'

import { Badge } from '../Badge'
import { Heading } from '../Typography'
import { Text } from '../Typography'

function StatCard({ children }: { children: ReactNode }) {
  return (
    <Stack
      gap={2}
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

function IconShieldCheck() {
  return (
    <Box color="#f5d547" display="flex" aria-hidden>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <title>Verified</title>
        <path
          d="M12 3 4 6v6c0 5 3.5 8.5 8 9.5 4.5-1 8-4.5 8-9.5V6l-8-3Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="m9 12 2 2 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  )
}

function IconEscrow() {
  return (
    <Box color="#f5d547" display="flex" aria-hidden>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <title>Secure payments</title>
        <path
          d="M4 10V8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2M4 10h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M12 15v3M10 16h4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </Box>
  )
}

export function RegisterMarketingPanel() {
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
        opacity={0.18}
        bgImage="repeating-linear-gradient(0deg, transparent, transparent 47px, rgba(255,255,255,0.05) 47px, rgba(255,255,255,0.05) 48px), repeating-linear-gradient(90deg, transparent, transparent 47px, rgba(255,255,255,0.05) 47px, rgba(255,255,255,0.05) 48px)"
        pointerEvents="none"
        aria-hidden
      />
      <Box
        position="absolute"
        inset={0}
        opacity={0.1}
        bgImage="linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 42%, transparent 58%, rgba(0,0,0,0.22) 100%)"
        pointerEvents="none"
        aria-hidden
      />

      <Stack gap={8} position="relative" zIndex={1} maxW="lg">
        <Badge
          alignSelf="flex-start"
          bg="rgba(0, 0, 0, 0.35)"
          color="white"
          fontSize="2xs"
          letterSpacing="0.1em"
          textTransform="uppercase"
          py={1.5}
          px={3}
          borderRadius="full"
          borderWidth="1px"
          borderColor="rgba(255,255,255,0.12)"
        >
          Trusted by 50,000+ pros
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
            Join the network built for those who{' '}
            <Box as="span" color="#f5d547">
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
            Whether you&apos;re fixing a leak or managing a commercial
            development, HandyBox connects craftsmanship with opportunity.
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
          <IconShieldCheck />
          <Text fontSize="md" fontWeight={700} color="white">
            Verified Pros
          </Text>
          <Text
            fontSize="sm"
            color="rgba(255, 255, 255, 0.78)"
            lineHeight="1.45"
          >
            Background checked & certified
          </Text>
        </StatCard>
        <StatCard>
          <IconEscrow />
          <Text fontSize="md" fontWeight={700} color="white">
            Secure Escrow
          </Text>
          <Text
            fontSize="sm"
            color="rgba(255, 255, 255, 0.78)"
            lineHeight="1.45"
          >
            Payments protected until completion
          </Text>
        </StatCard>
      </HStack>
    </Box>
  )
}
