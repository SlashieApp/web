import { Box, Container, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import type { Messages } from '@/i18n/getDictionary'
import { Button } from '@ui'

import { Magnetic } from '../Magnetic'
import { Reveal } from '../Reveal'

/**
 * Final conversion band on the SDL inverted ink surface (`bg.inverted` — the
 * semantic role for dark marketing bands), echoing the hero's green glow.
 */
export function FinalCtaBand({
  ctas,
  messages,
}: {
  ctas: Messages['common']['ctas']
  messages: Messages['landing']['finalCta']
}) {
  return (
    <Box
      as="section"
      position="relative"
      overflow="hidden"
      bg="bg.inverted"
      borderTopWidth="1px"
      borderColor="border.inverted"
      py={{ base: 14, md: 20 }}
    >
      <Box
        position="absolute"
        inset={0}
        aria-hidden
        bgImage="radial-gradient(38rem 16rem at 82% 120%, rgba(0, 220, 130, 0.14) 0%, transparent 70%)"
      />
      <Container
        maxW="6xl"
        px={{ base: 4, md: 6 }}
        position="relative"
        zIndex={1}
      >
        <Reveal>
          <HStack
            justify="space-between"
            align={{ base: 'flex-start', md: 'center' }}
            flexDirection={{ base: 'column', md: 'row' }}
            gap={8}
          >
            <Stack gap={2.5} maxW="lg">
              <Heading
                as="h2"
                fontFamily="display"
                fontSize={{ base: '28px', md: '36px' }}
                letterSpacing="-0.01em"
                color="text.onInverted"
              >
                {messages.heading}
              </Heading>
              <Text color="text.onInvertedMuted" lineHeight="tall">
                {messages.body}
              </Text>
            </Stack>
            <HStack gap={3} flexWrap="wrap">
              <Magnetic>
                <Button asChild size="lg" variant="primary">
                  <NextLink href="/register">{ctas.getStarted}</NextLink>
                </Button>
              </Magnetic>
              <Button
                asChild
                size="lg"
                variant="ghost"
                color="text.onInverted"
                borderWidth="1px"
                borderColor="border.glass"
                _hover={{ bg: 'bg.glass', color: 'text.onInverted' }}
                _active={{ bg: 'bg.glass', color: 'text.onInverted' }}
              >
                <NextLink href="/login">{ctas.logIn}</NextLink>
              </Button>
            </HStack>
          </HStack>
        </Reveal>
      </Container>
    </Box>
  )
}
