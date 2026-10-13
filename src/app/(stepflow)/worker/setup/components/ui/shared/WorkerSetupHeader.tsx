'use client'

import { Box, HStack, Text } from '@chakra-ui/react'
import { LuX } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'
import { IconButton, Link, Logo } from '@ui'

import bag from '../../../i11n.json'

type WorkerSetupHeaderProps = {
  exitHref: string
}

export function WorkerSetupHeader({ exitHref }: WorkerSetupHeaderProps) {
  const t = useI11n(bag)

  return (
    <Box
      as="header"
      bg="bg.surface"
      borderBottomWidth="1px"
      borderColor="border.default"
      minH={{ base: '56px', md: '64px' }}
      display="flex"
      alignItems="center"
    >
      <HStack
        gap={{ base: 3, md: 4 }}
        w="full"
        maxW={PAGE_CONTAINER_MAX_W}
        mx="auto"
        px={PAGE_GUTTER_X}
        minH={{ base: '56px', md: '64px' }}
        align="center"
      >
        {/* A link, so leaving keeps the locale and works without JS. */}
        <IconButton asChild aria-label={t.closeLabel} variant="ghost">
          <Link href={exitHref}>
            <LuX size={20} aria-hidden />
          </Link>
        </IconButton>
        <Logo containerProps={{ flexShrink: 0 }} />
        <Text
          fontSize={{ base: 'sm', md: 'md' }}
          fontWeight={600}
          color="text.default"
          flex={1}
          textAlign={{ base: 'left', md: 'center' }}
          truncate
        >
          {t.title}
        </Text>
        <Box
          display={{ base: 'none', md: 'block' }}
          w="44px"
          flexShrink={0}
          aria-hidden
        />
      </HStack>
    </Box>
  )
}
