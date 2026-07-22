'use client'

import { Box, HStack, IconButton, Text } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { LuX } from 'react-icons/lu'

import { useI11n } from '@/i18n/useI11n'
import { Logo } from '@ui'
import bag from '../../i11n.json'

type CreateTaskHeaderProps = {
  /** Where Close navigates (default: task browse). */
  exitHref?: string
}

/** Exit + logo bar for the create-task StepFlowLayout shell. */
export function CreateTaskHeader({
  exitHref = '/search?mode=tasks',
}: CreateTaskHeaderProps) {
  const router = useRouter()
  const t = useI11n(bag)

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
          aria-label={t.closeLabel}
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
          {t.eyebrow}
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
