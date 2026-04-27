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
  IconButton,
  Stack,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { Button } from '../Button'

/** Matches `Container`: horizontal page gutters. */
const drawerGutterX = { base: 4, md: 6 } as const

export type AppDrawerPlacement = 'start' | 'end' | 'top' | 'bottom'

export type AppDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: ReactNode
  children: ReactNode
  placement?: AppDrawerPlacement
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /** Footer button that closes the drawer; optional. */
  primaryActionLabel?: string
  onPrimaryAction?: () => void
}

function drawerPanelRadius(placement: AppDrawerPlacement) {
  if (placement === 'end') return { borderLeftRadius: 'xl' }
  if (placement === 'start') return { borderRightRadius: 'xl' }
  if (placement === 'bottom') return { borderTopRadius: '2xl' }
  return { borderBottomRadius: '2xl' }
}

export function AppDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  placement = 'start',
  size = 'md',
  primaryActionLabel,
  onPrimaryAction,
}: AppDrawerProps) {
  const radius = drawerPanelRadius(placement)

  return (
    <DrawerRoot
      open={open}
      onOpenChange={(d: { open: boolean }) => onOpenChange(d.open)}
      placement={placement}
      size={size}
    >
      <DrawerBackdrop bg="blackAlpha.600" />
      <DrawerPositioner>
        <DrawerContent
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
                  fontFamily="heading"
                  fontSize="lg"
                  fontWeight={800}
                  color="secondary.900"
                  lineHeight="short"
                  letterSpacing="-0.02em"
                  flex={1}
                  minW={0}
                >
                  {title}
                </DrawerTitle>
                <DrawerCloseTrigger asChild>
                  <IconButton
                    aria-label="Close drawer"
                    variant="ghost"
                    borderRadius="lg"
                    minW={11}
                    h={11}
                    fontSize="xl"
                    lineHeight={1}
                    color="secondary.900"
                    flexShrink={0}
                    _hover={{ bg: 'secondary.100' }}
                  >
                    ×
                  </IconButton>
                </DrawerCloseTrigger>
              </HStack>
              {description ? (
                <DrawerDescription
                  color="secondary.700"
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
          >
            <Box w="full" maxW="lg" mx="auto">
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
                borderRadius="xl"
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
