import {
  Box,
  Container,
  Grid,
  HStack,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react'
import {
  LuArrowRight,
  LuBanknote,
  LuMapPin,
  LuMessagesSquare,
} from 'react-icons/lu'

import { Reveal } from '../Reveal'

const STEPS = [
  {
    step: '01',
    title: 'Post a task',
    body: 'Describe the job, set your budget, and drop a pin where it needs doing.',
    icon: <LuMapPin size={22} />,
  },
  {
    step: '02',
    title: 'Compare quotes',
    body: 'Nearby workers reply with priced quotes, profiles, and reviews.',
    icon: <LuMessagesSquare size={22} />,
  },
  {
    step: '03',
    title: 'Accept & pay directly',
    body: 'Pick your worker and settle up directly, in person — no middleman, no platform fee.',
    icon: <LuBanknote size={22} />,
  },
] as const

export function HowItWorks() {
  return (
    <Box
      as="section"
      id="how-it-works"
      bg="bg.canvas"
      py={{ base: 16, md: 24 }}
      scrollMarginTop={{ base: '56px', md: '64px' }}
    >
      <Container maxW="6xl" px={{ base: 4, md: 6 }}>
        <Stack gap={{ base: 10, md: 14 }}>
          <Reveal>
            <Stack gap={3} textAlign="center" align="center">
              <Heading
                as="h2"
                fontFamily="display"
                fontSize={{ base: '28px', md: '36px' }}
                letterSpacing="-0.01em"
              >
                How Slashie works
              </Heading>
              <Text color="text.muted" maxW="65ch">
                Three steps from “I need a hand” to done — all on the map.
              </Text>
            </Stack>
          </Reveal>

          <Grid
            templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
            gap={{ base: 8, md: 6 }}
            alignItems="start"
          >
            {STEPS.map((item, index) => (
              <Reveal key={item.step} delayMs={index * 110}>
                <Stack gap={4} position="relative" px={{ md: 3 }}>
                  <HStack justify="space-between" align="center">
                    <Box
                      boxSize="48px"
                      borderRadius="xl"
                      bg="status.success.soft"
                      color="status.success.fg"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      aria-hidden
                    >
                      {item.icon}
                    </Box>
                    {index < STEPS.length - 1 ? (
                      <Box
                        display={{ base: 'none', md: 'flex' }}
                        color="border.strong"
                        aria-hidden
                      >
                        <LuArrowRight size={20} />
                      </Box>
                    ) : null}
                  </HStack>
                  <Text
                    fontSize="xs"
                    fontWeight={700}
                    letterSpacing="0.12em"
                    color="text.link"
                  >
                    {item.step}
                  </Text>
                  <Heading as="h3" fontSize="20px" fontWeight={600}>
                    {item.title}
                  </Heading>
                  <Text fontSize="sm" color="text.muted" lineHeight="tall">
                    {item.body}
                  </Text>
                </Stack>
              </Reveal>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Box>
  )
}
