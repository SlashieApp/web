'use client'

import type { ReactNode } from 'react'

import {
  Box,
  Button as ChakraButton,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerPositioner,
  DrawerRoot,
  DrawerTitle,
  HStack,
  IconButton,
  Input,
  InputGroup,
  SimpleGrid,
  Slider,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Button } from '@ui'

import {
  useTaskBrowseFiltersProps,
  useTaskBrowseLayout,
} from '../../context/TaskBrowseProvider'
import type {
  TaskBrowseFiltersProps,
  UrgencyFilter,
} from '../../helpers/taskBrowseFilters.types'

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

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Text fontSize="sm" fontWeight={600} color="formLabelMuted">
      {children}
    </Text>
  )
}

function IconEmergencyDiamond() {
  return (
    <Box as="span" w="22px" h="22px" display="inline-flex" alignItems="center">
      <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
        <title>Emergency</title>
        <path
          d="M12 4 20 12 12 20 4 12 12 4Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path
          d="M12 8v5M12 16h.01"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    </Box>
  )
}

type UrgencyCardProps = {
  label: string
  active: boolean
  onClick: () => void
  icon: ReactNode
  accent?: 'emergency'
}

function UrgencyCard({
  label,
  active,
  onClick,
  icon,
  accent,
}: UrgencyCardProps) {
  const isEmergency = accent === 'emergency'
  return (
    <ChakraButton
      type="button"
      variant="outline"
      flex="1"
      minW={0}
      h="auto"
      py={3}
      px={2}
      borderRadius="lg"
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={1.5}
      fontWeight={800}
      fontSize="10px"
      letterSpacing="0.04em"
      whiteSpace="normal"
      lineHeight="1.1"
      borderWidth="1px"
      bg={active ? (isEmergency ? 'jobCardBg' : 'primary.50') : 'badgeBg'}
      borderColor={
        active ? (isEmergency ? 'secondary.400' : 'primary.500') : 'transparent'
      }
      color={
        active
          ? isEmergency
            ? 'jobCardTitle'
            : 'primary.600'
          : 'formLabelMuted'
      }
      boxShadow="none"
      _hover={{
        bg: active
          ? isEmergency
            ? 'secondary.100'
            : 'primary.100'
          : 'jobCardDivider',
      }}
      onClick={onClick}
      aria-pressed={active}
    >
      {icon}
      <Text as="span" textAlign="center">
        {label}
      </Text>
    </ChakraButton>
  )
}

function cycleUrgency(
  current: UrgencyFilter,
  target: UrgencyFilter,
): UrgencyFilter {
  return current === target ? 'any' : target
}

function MobileBrowseFiltersSheetBody(props: TaskBrowseFiltersProps) {
  const {
    variant: _variant,
    showMapPromo: _showMapPromo,
    sortValue: _sort,
    sortOptions: _sortOptions,
    onSortChange: _onSortChange,
    radiusMiles,
    onRadiusChange,
    minBudgetPounds,
    maxBudgetPounds,
    onMinBudgetChange,
    onMaxBudgetChange,
    urgency,
    onUrgencyChange,
  } = props

  const radius = Math.min(50, Math.max(1, radiusMiles))

  return (
    <Stack gap={6} pb={2}>
      <Stack gap={3}>
        <HStack justify="space-between" align="baseline">
          <SectionLabel>Discovery radius</SectionLabel>
          <Text fontSize="sm" fontWeight={800} color="primary.600">
            {radius} miles
          </Text>
        </HStack>
        <Slider.Root
          min={1}
          max={50}
          step={1}
          value={[radius]}
          colorPalette="blue"
          onValueChange={(d) => {
            const next = d.value[0]
            if (typeof next === 'number') onRadiusChange(next)
          }}
        >
          <Slider.Control>
            <Slider.Track bg="jobCardDivider">
              <Slider.Range bg="primary.600" />
            </Slider.Track>
            <Slider.Thumbs />
          </Slider.Control>
        </Slider.Root>
        <HStack justify="space-between">
          <Text
            fontSize="10px"
            fontWeight={700}
            letterSpacing="0.08em"
            color="formLabelMuted"
          >
            1 MILES
          </Text>
          <Text
            fontSize="10px"
            fontWeight={700}
            letterSpacing="0.08em"
            color="formLabelMuted"
          >
            50 MILES
          </Text>
        </HStack>
      </Stack>

      <Stack gap={3}>
        <SectionLabel>Budget range (£)</SectionLabel>
        <SimpleGrid columns={2} gap={3}>
          <InputGroup
            startElement={
              <Text
                color="formLabelMuted"
                fontSize="sm"
                fontWeight={600}
                ps={3}
              >
                £
              </Text>
            }
          >
            <Input
              inputMode="decimal"
              placeholder="Min"
              value={minBudgetPounds}
              onChange={(e) => onMinBudgetChange(e.target.value)}
              h={12}
              borderRadius="lg"
              borderWidth="1px"
              borderColor="formControlBorder"
              ps="2.25rem"
            />
          </InputGroup>
          <InputGroup
            startElement={
              <Text
                color="formLabelMuted"
                fontSize="sm"
                fontWeight={600}
                ps={3}
              >
                £
              </Text>
            }
          >
            <Input
              inputMode="decimal"
              placeholder="Max"
              value={maxBudgetPounds}
              onChange={(e) => onMaxBudgetChange(e.target.value)}
              h={12}
              borderRadius="lg"
              borderWidth="1px"
              borderColor="formControlBorder"
              ps="2.25rem"
            />
          </InputGroup>
        </SimpleGrid>
      </Stack>

      <Stack gap={3}>
        <SectionLabel>Urgency</SectionLabel>
        <HStack gap={2} align="stretch">
          <UrgencyCard
            label="EMERGENCY"
            accent="emergency"
            active={urgency === 'emergency'}
            onClick={() => onUrgencyChange(cycleUrgency(urgency, 'emergency'))}
            icon={<IconEmergencyDiamond />}
          />
        </HStack>
      </Stack>
    </Stack>
  )
}

/** Opens / toggles the mobile filter drawer; owns layout `isFilterOpen` subscription so `MobileLayout` does not. */
export function MobileTaskBrowseFiltersTrigger() {
  const { isFilterOpen, setIsFilterOpen } = useTaskBrowseLayout()
  return (
    <Button
      type="button"
      size="sm"
      variant={isFilterOpen ? 'primary' : 'secondary'}
      px={2.5}
      py={1}
      onClick={() => setIsFilterOpen(!isFilterOpen)}
      pointerEvents="auto"
    >
      Filters
    </Button>
  )
}

/**
 * Mobile task browse: bottom sheet (handle, rounded top, scrollable filter
 * fields, apply footer). Map and carousel stay mounted underneath.
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
          bg="neutral.100"
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
              bg="formControlBorder"
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
                color="jobCardTitle"
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
            <MobileBrowseFiltersSheetBody {...filterProps} />
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
