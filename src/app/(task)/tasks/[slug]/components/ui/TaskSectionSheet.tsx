'use client'

import { Box, HStack, Stack, Text, chakra } from '@chakra-ui/react'
import { type ReactNode, useState } from 'react'
import { LuChevronRight } from 'react-icons/lu'

import { sdlFocusRing } from '@/theme/styles'
import { Drawer } from '@ui'

const TriggerButton = chakra('button')

/**
 * Phones: a hairline row (icon, title, one-line summary, chevron) that opens
 * its content in a bottom sheet; Home's and My tasks' rows, not a card
 * (FE-524). Put the rows in a `TaskSectionRows`, which draws the rule above
 * the first. On web the same content sits open in the rail.
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
        px={0}
        py={3}
        borderBottomWidth="1px"
        borderColor="border.default"
        bg="transparent"
        textAlign="start"
        cursor="pointer"
        _focusVisible={sdlFocusRing}
      >
        <Box
          aria-hidden
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
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

/**
 * Phones: the group of `TaskSectionSheet` rows, with the rule above the first
 * (each row draws the one under it). Hidden when no row renders, and from
 * `lg`, where the rail shows the same content open.
 */
export function TaskSectionRows({ children }: { children: ReactNode }) {
  return (
    <Stack
      data-task-section-rows=""
      gap={0}
      display={{ base: 'flex', lg: 'none' }}
      borderTopWidth="1px"
      borderColor="border.default"
      css={{ '&:empty': { display: 'none' } }}
    >
      {children}
    </Stack>
  )
}
