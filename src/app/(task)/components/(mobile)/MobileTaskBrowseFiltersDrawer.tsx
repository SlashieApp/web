'use client'

import {
  Box,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerPositioner,
  DrawerRoot,
  DrawerTitle,
  IconButton,
} from '@chakra-ui/react'

import { Button } from '@ui'
import {
  useTaskBrowseFiltersProps,
  useTaskBrowseLayout,
} from '../../context/TaskBrowseProvider'

import { MobileTaskBrowseFiltersSheetPanel } from './MobileTaskBrowseFiltersSheetPanel'

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Close</title>
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * Mobile task browse: bottom sheet with design-system chrome (handle, rounded
 * top, primary footer). Map and carousel stay mounted underneath.
 */
export function MobileTaskBrowseFiltersDrawer() {
  const { isFilterOpen, setIsFilterOpen } = useTaskBrowseLayout()
  const filterProps = useTaskBrowseFiltersProps('compact')

  return (
    <DrawerRoot
      open={isFilterOpen}
      onOpenChange={(d: { open: boolean }) => setIsFilterOpen(d.open)}
      placement="bottom"
      size="full"
    >
      <DrawerBackdrop bg="blackAlpha.600" />
      <DrawerPositioner>
        <DrawerContent
          borderTopLeftRadius="3xl"
          borderTopRightRadius="3xl"
          bg="surfaceContainerLowest"
          maxH="96dvh"
          display="flex"
          flexDirection="column"
          boxShadow="ambient"
        >
          <DrawerHeader
            borderBottomWidth={0}
            px={5}
            pt={3}
            pb={0}
            flexShrink={0}
          >
            <Box
              aria-hidden
              mx="auto"
              mb={4}
              w="40px"
              h="4px"
              borderRadius="full"
              bg="outlineVariant"
            />
            <Box
              display="flex"
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              gap={3}
            >
              <DrawerTitle
                fontFamily="heading"
                fontSize="xl"
                fontWeight={800}
                color="fg"
                lineHeight="short"
              >
                Filters
              </DrawerTitle>
              <DrawerCloseTrigger asChild>
                <IconButton
                  aria-label="Close filters"
                  borderRadius="full"
                  size="md"
                  bg="primary.50"
                  color="primary.600"
                  minW={11}
                  h={11}
                  _hover={{ bg: 'primary.100' }}
                >
                  <CloseIcon />
                </IconButton>
              </DrawerCloseTrigger>
            </Box>
          </DrawerHeader>
          <DrawerBody flex="1" minH={0} overflowY="auto" px={5} pt={4} pb={2}>
            <MobileTaskBrowseFiltersSheetPanel {...filterProps} />
          </DrawerBody>
          <DrawerFooter
            borderTopWidth={0}
            flexShrink={0}
            px={5}
            pt={2}
            pb="calc(16px + env(safe-area-inset-bottom, 0px))"
          >
            <Button
              type="button"
              w="full"
              size="lg"
              borderRadius="xl"
              onClick={() => setIsFilterOpen(false)}
            >
              Apply filters
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </DrawerPositioner>
    </DrawerRoot>
  )
}
