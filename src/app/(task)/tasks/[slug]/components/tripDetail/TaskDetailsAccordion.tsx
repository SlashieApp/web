'use client'

import { Box, Collapsible, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { LuChevronDown } from 'react-icons/lu'

import { sdlMotion } from '@/theme/styles'
import { Card } from '@ui'

import { MainSectionContent } from '../mainSection/MainSectionContent'
import { VisitorMeta } from '../metaSection/VisitorMeta'

/**
 * Secondary details (about, budget + payment, category, timing, urgency,
 * posted/views), lower visual weight and collapsible - they sit below the hero.
 */
export function TaskDetailsAccordion({
  defaultOpen = false,
}: {
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Card layout="default" p={0} overflow="hidden">
      <Collapsible.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
        <Collapsible.Trigger
          aria-label="Toggle task details"
          width="100%"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          px={{ base: 4, md: 5 }}
          py={4}
          minH="44px"
          cursor="pointer"
          bg="transparent"
          _hover={{ bg: 'bg.subtle' }}
          _focusVisible={{
            outline: '2px solid',
            outlineColor: 'border.focus',
            outlineOffset: '-2px',
          }}
          transitionProperty="background-color"
          transitionDuration={sdlMotion.duration.base}
        >
          <Text fontWeight={600} color="text.default">
            Task details
          </Text>
          <Box
            as="span"
            display="inline-flex"
            color="text.muted"
            transform={open ? 'rotate(180deg)' : 'rotate(0deg)'}
            transitionProperty="transform"
            transitionDuration={sdlMotion.duration.moderate}
            transitionTimingFunction={sdlMotion.easing.standard}
          >
            <LuChevronDown />
          </Box>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <Stack
            gap={5}
            px={{ base: 4, md: 5 }}
            pb={5}
            borderTopWidth="1px"
            borderColor="border.default"
            pt={4}
          >
            <MainSectionContent />
            <VisitorMeta showMap={false} />
          </Stack>
        </Collapsible.Content>
      </Collapsible.Root>
    </Card>
  )
}
