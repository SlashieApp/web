'use client'

import {
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerPositioner,
  DrawerRoot,
  DrawerTitle,
  Link,
  Stack,
} from '@chakra-ui/react'
import NextLink from 'next/link'

export type NavDrawerLink = {
  label: string
  href: string
}

export type NavDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  links: readonly NavDrawerLink[]
  /** Shown below the link list (e.g. auth actions). */
  footer?: React.ReactNode
  placement?: 'start' | 'end'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'full'
}

export function NavDrawer({
  open,
  onOpenChange,
  title,
  links,
  footer,
  placement = 'end',
  size = 'sm',
}: NavDrawerProps) {
  return (
    <DrawerRoot
      open={open}
      onOpenChange={(e) => onOpenChange(e.open)}
      placement={placement}
      size={size}
    >
      <DrawerBackdrop />
      <DrawerPositioner>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerCloseTrigger aria-label="Close menu" />
          </DrawerHeader>
          <DrawerBody>
            <Stack as="nav" gap={1} align="stretch" aria-label="Main">
              {links.map((item) => (
                <Link
                  key={`${item.href}-${item.label}`}
                  as={NextLink}
                  href={item.href}
                  onClick={() => onOpenChange(false)}
                  display="block"
                  py={3}
                  px={2}
                  borderRadius="lg"
                  fontWeight={600}
                  fontSize="md"
                  color="fg"
                  _hover={{ bg: 'surfaceContainerLow', textDecoration: 'none' }}
                >
                  {item.label}
                </Link>
              ))}
            </Stack>
          </DrawerBody>
          {footer ? (
            <DrawerFooter flexDir="column" alignItems="stretch" gap={3}>
              {footer}
            </DrawerFooter>
          ) : null}
        </DrawerContent>
      </DrawerPositioner>
    </DrawerRoot>
  )
}
