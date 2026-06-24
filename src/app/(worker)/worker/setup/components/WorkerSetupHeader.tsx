'use client'

import { Box, HStack, IconButton, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { LuX } from 'react-icons/lu'

import { Logo } from '@ui'

type WorkerSetupHeaderProps = {
  exitHref: string
}

export function WorkerSetupHeader({ exitHref }: WorkerSetupHeaderProps) {
  const router = useRouter()

  return (
    <Box
      as="header"
      bg="bg.surface"
      borderBottomWidth="1px"
      borderColor="border.default"
      px={{ base: 4, md: 6 }}
      minH={{ base: '56px', md: '64px' }}
      display="flex"
      alignItems="center"
    >
      <HStack gap={{ base: 3, md: 4 }} w="full" align="center">
        <IconButton
          aria-label="Close worker setup"
          variant="ghost"
          size="sm"
          minW="44px"
          minH="44px"
          onClick={() => router.push(exitHref)}
        >
          <LuX size={20} aria-hidden />
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
          Set up your worker profile
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
