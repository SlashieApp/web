'use client'

import {
  Box,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerPositioner,
  DrawerRoot,
  DrawerTitle,
  HStack,
  Stack,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { Button } from '../Button'
import { IconButton as UiIconButton } from '../IconButton/IconButton'

/** Matches `Container`: horizontal page gutters. */
const drawerGutterX = { base: 4, md: 6 } as const

export type DrawerPlacement = 'start' | 'end' | 'top' | 'bottom'

export type DrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: ReactNode
  children: ReactNode
  placement?: DrawerPlacement
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /** Footer button that closes the drawer; optional. */
  primaryActionLabel?: string
  onPrimaryAction?: () => void
}

function drawerPanelRadius(placement: DrawerPlacement) {
  if (placement === 'end') return { borderLeftRadius: 'md' }
  if (placement === 'start') return { borderRightRadius: 'md' }
  if (placement === 'bottom') return { borderTopRadius: 'md' }
  return { borderBottomRadius: 'md' }
}

export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  placement = 'start',
  size = 'md',
  primaryActionLabel,
  onPrimaryAction,
}: DrawerProps) {
  const radius = drawerPanelRadius(placement)

  return (
    <DrawerRoot
      open={open}
      onOpenChange={(d: { open: boolean }) => onOpenChange(d.open)}
      placement={placement}
      size={size}
    >
      <DrawerBackdrop bg="blackAlpha.500" backdropFilter="blur(4px)" />
      <DrawerPositioner>
        <DrawerContent
          colorPalette="green"
          bg="bg"
          boxShadow="none"
          display="flex"
          flexDirection="column"
          maxH="100dvh"
          {...radius}
        >
          <DrawerHeader px={drawerGutterX} pt={4} pb={4} flexShrink={0}>
            <Stack gap={description ? 2 : 0} align="stretch">
              <HStack align="center" justify="space-between" gap={3} minH={11}>
                <DrawerTitle
                  fontFamily="body"
                  fontSize="20px"
                  fontWeight={600}
                  color="cardFg"
                  lineHeight="short"
                  flex={1}
                  minW={0}
                >
                  {title}
                </DrawerTitle>
                <DrawerCloseTrigger asChild>
                  <UiIconButton
                    aria-label="Close drawer"
                    variant="ghost"
                    flexShrink={0}
                  >
                    ×
                  </UiIconButton>
                </DrawerCloseTrigger>
              </HStack>
              {description ? (
                <DrawerDescription
                  color="formLabelMuted"
                  fontSize="sm"
                  lineHeight="tall"
                  fontWeight={500}
                >
                  {description}
                </DrawerDescription>
              ) : null}
            </Stack>
          </DrawerHeader>
          <DrawerBody
            px={drawerGutterX}
            pt={5}
            pb={6}
            flex={1}
            minH={0}
            overflowY="auto"
            display="flex"
            flexDirection="column"
          >
            <Box
              w="full"
              maxW="lg"
              mx="auto"
              flex={1}
              display="flex"
              flexDirection="column"
              minH={0}
            >
              {children}
            </Box>
          </DrawerBody>
          {primaryActionLabel ? (
            <DrawerFooter
              px={drawerGutterX}
              pt={3}
              pb="calc(16px + env(safe-area-inset-bottom, 0px))"
              flexShrink={0}
            >
              <Button
                variant="primary"
                w="full"
                size="lg"
                onClick={() => {
                  onPrimaryAction?.()
                  onOpenChange(false)
                }}
              >
                {primaryActionLabel}
              </Button>
            </DrawerFooter>
          ) : null}
        </DrawerContent>
      </DrawerPositioner>
    </DrawerRoot>
  )
}
