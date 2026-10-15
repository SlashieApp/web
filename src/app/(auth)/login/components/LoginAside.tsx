'use client'

import { Box, HStack, Heading, Stack, Text } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'
import { Badge } from '@ui'

import bag from '../i11n.json'

/** Desktop only: the brand panel beside the sign-in column. */
export function LoginAside() {
  const t = useI11n(bag)

  return (
    <Box
      position="relative"
      overflow="hidden"
      display={{ base: 'none', lg: 'flex' }}
      flex="1 1 50%"
      flexDirection="column"
      justifyContent="space-between"
      alignSelf="stretch"
      minW={0}
      borderRadius="2xl"
      px={{ lg: 10, xl: 14 }}
      py={{ lg: 12, xl: 14 }}
      bg="bg.brandHero"
      color="text.onBrand"
      /* SDL: brand/auth hero surface (bg.brandHero) with on-brand white text roles.
         The remaining rgba() below are intentional decorative textures (grid +
         diagonal gradient wash), not color roles. */
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
        {/* Brand-accent badge: the vivid green ramp (green.300/600/900) is an
            intentional hero accent, not a success STATE, so it stays off the
            status.success.* roles. */}
        <Badge
          alignSelf="flex-start"
          bg="green.300"
          color="green.900"
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
            bg="green.600"
            boxShadow="inset 0 0 0 1px rgba(255,255,255,0.25)"
            aria-hidden
          />
          {t.asideBadge}
        </Badge>

        <Box>
          {/* Desktop-only marketing line; the form title is the page h1. */}
          <Heading
            as="p"
            fontSize={{ lg: '4xl', xl: '5xl' }}
            lineHeight="1.1"
            fontWeight={800}
            color="text.onBrand"
            letterSpacing="-0.03em"
          >
            {t.asideTitle}
          </Heading>
          <Text
            mt={5}
            fontSize="lg"
            lineHeight="1.55"
            color="text.onBrandMuted"
            fontWeight={500}
          >
            {t.asideDescription}
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
        {t.asideStats.map((stat) => (
          <Stack
            key={stat.title}
            gap={1}
            flex={1}
            minW={0}
            borderRadius="lg"
            px={{ base: 4, md: 5 }}
            py={4}
            bg="bg.glass"
            borderWidth="1px"
            borderColor="border.glass"
            backdropFilter="blur(10px)"
          >
            <Text
              fontSize="xl"
              fontWeight={800}
              lineHeight="1.2"
              color="text.onBrand"
            >
              {stat.title}
            </Text>
            <Text
              fontSize="xs"
              fontWeight={700}
              letterSpacing="0.06em"
              color="text.onBrandSubtle"
              textTransform="uppercase"
            >
              {stat.caption}
            </Text>
          </Stack>
        ))}
      </HStack>
    </Box>
  )
}
