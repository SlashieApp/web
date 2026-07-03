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
import { LuX } from 'react-icons/lu'

import { sdlMotion } from '@/theme/styles'

import { Button } from '../Button'
import { IconButton as UiIconButton } from '../IconButton/IconButton'

/** Matches `Container`: horizontal page gutters. */
const drawerGutterX = { base: 4, md: 6 } as const

export type DrawerPlacement = 'start' | 'end' | 'top' | 'bottom'

export type DrawerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

export type DrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: ReactNode
  children: ReactNode
  placement?: DrawerPlacement
  size?: DrawerSize
  /** Footer button that closes the drawer; optional. */
  primaryActionLabel?: string
  onPrimaryAction?: () => void
}

function drawerPanelRadius(placement: DrawerPlacement) {
  if (placement === 'end') return { borderLeftRadius: 'lg' }
  if (placement === 'start') return { borderRightRadius: 'lg' }
  if (placement === 'bottom') return { borderTopRadius: 'lg' }
  return { borderBottomRadius: 'lg' }
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
      {/* Scrim: dim + blur the page behind the panel. Click + ESC close are
          handled by DrawerRoot, which also traps focus inside the panel. */}
      <DrawerBackdrop
        bg="bg.overlay"
        backdropFilter="blur(4px)"
        transitionProperty="opacity"
        transitionDuration={sdlMotion.duration.moderate}
        transitionTimingFunction={sdlMotion.easing.standard}
        css={{
          '@media (prefers-reduced-motion: reduce)': {
            transitionDuration: '0ms',
          },
        }}
      />
      <DrawerPositioner>
        <DrawerContent
          colorPalette="green"
          bg="bg.surface"
          color="text.default"
          borderColor="border.default"
          boxShadow="e4"
          display="flex"
          flexDirection="column"
          maxH="100dvh"
          transitionProperty="transform, opacity"
          transitionDuration={sdlMotion.duration.moderate}
          transitionTimingFunction={sdlMotion.easing.decelerate}
          css={{
            '@media (prefers-reduced-motion: reduce)': {
              transitionDuration: '0ms',
            },
          }}
          {...radius}
        >
          <DrawerHeader px={drawerGutterX} pt={4} pb={4} flexShrink={0}>
            <Stack gap={description ? 2 : 0} align="stretch">
              <HStack align="center" justify="space-between" gap={3} minH={11}>
                <DrawerTitle
                  fontFamily="body"
                  fontSize="20px"
                  fontWeight={600}
                  color="text.default"
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
                    minW="44px"
                    minH="44px"
                  >
                    <LuX size={20} strokeWidth={2} aria-hidden />
                  </UiIconButton>
                </DrawerCloseTrigger>
              </HStack>
              {description ? (
                <DrawerDescription
                  color="text.muted"
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
              borderTopWidth="1px"
              borderColor="border.default"
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
