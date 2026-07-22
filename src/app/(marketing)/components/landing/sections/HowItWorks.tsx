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

import type { Messages } from '@/i18n/getDictionary'

import { Reveal } from '../Reveal'

const STEP_ICONS = [
  <LuMapPin key="post" size={22} />,
  <LuMessagesSquare key="quotes" size={22} />,
  <LuBanknote key="pay" size={22} />,
] as const

export function HowItWorks({
  messages,
}: {
  messages: Messages['landing']['howItWorks']
}) {
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
                {messages.heading}
              </Heading>
              <Text color="text.muted" maxW="65ch">
                {messages.body}
              </Text>
            </Stack>
          </Reveal>

          <Grid
            templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
            gap={{ base: 8, md: 6 }}
            alignItems="start"
          >
            {messages.steps.map((item, index) => (
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
                      {STEP_ICONS[index]}
                    </Box>
                    {index < messages.steps.length - 1 ? (
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
