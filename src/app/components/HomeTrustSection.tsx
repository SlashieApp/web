'use client'

import { Box, HStack, Stack } from '@chakra-ui/react'

import { GlassCard, Heading, Text } from '@ui'

const trustItems = [
  {
    title: 'Satisfaction Guarantee',
    body: 'We stand by every job. We will make it right.',
  },
  {
    title: 'Vetted & Insured Pros',
    body: 'Every handyman undergoes strict background checks.',
  },
  {
    title: 'Secure Payments',
    body: 'Payment is only released when you are 100% satisfied.',
  },
] as const

export function HomeTrustSection() {
  return (
    <GlassCard
      bg="linear-gradient(140deg, #003fb1 0%, #1a56db 100%)"
      color="white"
      borderRadius="3xl"
      p={{ base: 6, md: 10 }}
    >
      <HStack
        align="stretch"
        gap={8}
        flexDirection={{ base: 'column', lg: 'row' }}
      >
        <Stack flex="1" gap={5}>
          <Heading size="3xl" color="white">
            Your Home is Safe with
            <br />
            HandyBox Protection
          </Heading>
          <Text color="rgba(234,241,255,0.9)" maxW="xl">
            We stand by every job. Our comprehensive protection program ensures
            you are covered from start to finish.
          </Text>
          <Stack gap={4} pt={1}>
            {trustItems.map((item) => (
              <HStack key={item.title} align="start" gap={3}>
                <Box
                  w="22px"
                  h="22px"
                  mt="2px"
                  borderRadius="full"
                  bg="secondaryFixed"
                  color="onSecondaryFixed"
                  fontSize="xs"
                  fontWeight={800}
                  display="grid"
                  placeItems="center"
                >
                  ✓
                </Box>
                <Stack gap={0.5}>
                  <Text color="white" fontWeight={700}>
                    {item.title}
                  </Text>
                  <Text color="rgba(234,241,255,0.78)" fontSize="sm">
                    {item.body}
                  </Text>
                </Stack>
              </HStack>
            ))}
          </Stack>
        </Stack>

        <GlassCard
          flex={{ base: 'unset', lg: '0 0 360px' }}
          bg="rgba(255,255,255,0.1)"
          borderRadius="2xl"
          p={5}
          boxShadow="none"
        >
          <Stack gap={4}>
            <HStack justify="space-between">
              <HStack>
                <Box
                  w="40px"
                  h="40px"
                  borderRadius="full"
                  bg="secondaryContainer"
                  display="grid"
                  placeItems="center"
                  color="onSecondaryFixed"
                  fontWeight={700}
                >
                  MC
                </Box>
                <Stack gap={0}>
                  <Text color="white" fontWeight={700}>
                    Marcus Chen
                  </Text>
                  <Text color="rgba(234,241,255,0.85)" fontSize="xs">
                    Master Carpenter • 12 years exp.
                  </Text>
                </Stack>
              </HStack>
              <Box
                px={2}
                py={1}
                borderRadius="full"
                bg="secondaryContainer"
                color="onSecondaryFixed"
                fontSize="10px"
                fontWeight={800}
              >
                PRO
              </Box>
            </HStack>
            <Box h="6px" borderRadius="full" bg="rgba(255,255,255,0.2)" />
            <Box h="6px" w="86%" borderRadius="full" bg="rgba(255,255,255,0.2)" />
            <Box h="6px" w="72%" borderRadius="full" bg="rgba(255,255,255,0.2)" />
            <HStack justify="space-between" pt={2}>
              <Text color="secondaryFixed" fontSize="sm">
                ★★★★★
              </Text>
              <Text color="white" fontWeight={700}>
                4.9 / 5 Rating
              </Text>
            </HStack>
          </Stack>
        </GlassCard>
      </HStack>
    </GlassCard>
  )
}
