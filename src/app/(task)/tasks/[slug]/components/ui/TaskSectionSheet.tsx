'use client'

import { Box, HStack, Stack, Text, chakra } from '@chakra-ui/react'
import { type ReactNode, useState } from 'react'
import { LuChevronRight } from 'react-icons/lu'

import { sdlFocusRing } from '@/theme/styles'
import { Drawer } from '@ui'

const TriggerButton = chakra('button')

/**
 * Phones: a section card (icon, title, one-line summary) that opens its
 * content in a bottom sheet. On web the same content sits open in the rail.
 */
export function TaskSectionSheet({
  icon,
  title,
  summary,
  defaultOpen = false,
  children,
}: {
  icon: ReactNode
  title: string
  summary?: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Box display={{ base: 'block', lg: 'none' }}>
      <TriggerButton
        type="button"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        display="flex"
        alignItems="center"
        gap={3}
        w="full"
        minH="56px"
        px={4}
        py={3}
        borderRadius="xl"
        borderWidth="1px"
        borderColor="border.default"
        bg="bg.surface"
        textAlign="start"
        cursor="pointer"
        _hover={{ bg: 'bg.subtle' }}
        _focusVisible={sdlFocusRing}
      >
        <Box
          aria-hidden
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          boxSize="36px"
          flexShrink={0}
          borderRadius="lg"
          bg="bg.subtle"
          color="text.muted"
        >
          {icon}
        </Box>
        <Stack gap={0} flex={1} minW={0}>
          <Text fontWeight={500} color="text.default">
            {title}
          </Text>
          {summary ? (
            <Text fontSize="sm" color="text.muted" truncate>
              {summary}
            </Text>
          ) : null}
        </Stack>
        <HStack color="text.muted" aria-hidden>
          <LuChevronRight size={18} />
        </HStack>
      </TriggerButton>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        title={title}
        placement="bottom"
      >
        {children}
      </Drawer>
    </Box>
  )
}
