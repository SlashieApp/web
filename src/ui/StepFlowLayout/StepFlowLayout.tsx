'use client'

import type { ReactNode } from 'react'

import {
  Box,
  Grid,
  HStack,
  Stack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { LuArrowLeft, LuArrowRight } from 'react-icons/lu'

import { Button } from '../Button/Button'
import { ProgressBar } from '../ProgressBar'

/**
 * SDL StepFlowLayout — the shared shell for multi-step flows (send a quote,
 * worker profile setup, task creation).
 *
 * Anatomy:
 * - Desktop (lg+): a `7xl` grid with a stepper rail, a raised step panel
 *   (scrollable heading + content, sticky action bar), and an optional
 *   context `aside` third column.
 * - Mobile: optional `mobileTop` context region, the `progress` bar, a
 *   scrollable body (default: heading + content on `bg.surface`; or a custom
 *   `mobileBody` such as an accordion), and the sticky action bar.
 *
 * The layout owns structure only — step state, validation, and navigation
 * stay in each flow's context/config. Compose the flow's own stepper and
 * progress data through the slots.
 */

export type StepFlowHeadingProps = {
  title: string
  description?: string
  compact?: boolean
}

/** Step title + supporting copy (`h1` of the flow screen). */
export function StepFlowHeading({
  title,
  description,
  compact = false,
}: StepFlowHeadingProps) {
  return (
    <Stack gap={compact ? 1 : 2}>
      <Text
        as="h1"
        fontSize={compact ? 'xl' : { base: '2xl', md: '3xl' }}
        fontWeight={800}
        lineHeight="short"
        color="text.default"
        letterSpacing="-0.02em"
      >
        {title}
      </Text>
      {description ? (
        <Text fontSize="sm" color="text.muted" lineHeight="tall">
          {description}
        </Text>
      ) : null}
    </Stack>
  )
}

export type StepFlowActionsProps = {
  showBack?: boolean
  continueLabel?: string
  continueLoading?: boolean
  /** Final submit action: drops the trailing arrow. */
  isFinal?: boolean
  onBack?: () => void
  onContinue?: () => void
  sticky?: boolean
}

/** Back / Continue bar. Sticky on mobile; static inside the desktop panel. */
export function StepFlowActions({
  showBack = false,
  continueLabel = 'Continue',
  continueLoading = false,
  isFinal = false,
  onBack,
  onContinue,
  sticky = false,
}: StepFlowActionsProps) {
  return (
    <Box
      borderTopWidth="1px"
      borderColor="border.strong"
      bg="bg.surface"
      px={{ base: 4, md: 8, lg: 10 }}
      py={4}
      position={sticky ? 'sticky' : 'static'}
      bottom={0}
      zIndex={2}
      flexShrink={0}
      pb={{ base: 'calc(16px + env(safe-area-inset-bottom))', lg: 4 }}
    >
      <HStack justify="space-between" gap={3} w="full" align="center">
        {showBack ? (
          <Button
            type="button"
            variant="ghost"
            color="text.link"
            fontWeight={600}
            px={0}
            minH="44px"
            onClick={onBack}
            _hover={{ bg: 'transparent', color: 'text.link' }}
          >
            <HStack gap={2}>
              <LuArrowLeft size={18} aria-hidden />
              <span>Back</span>
            </HStack>
          </Button>
        ) : (
          <Box flexShrink={0} w={{ base: 0, lg: '88px' }} />
        )}
        <Button
          type="button"
          variant="primary"
          onClick={onContinue}
          loading={continueLoading}
          minH="44px"
          minW={{ base: 'full', lg: 'auto' }}
          flex={{ base: 1, lg: 'none' }}
          ml="auto"
          borderRadius="md"
          px={6}
        >
          <HStack gap={2}>
            <span>{continueLabel}</span>
            {isFinal ? null : <LuArrowRight size={18} aria-hidden />}
          </HStack>
        </Button>
      </HStack>
    </Box>
  )
}

export type StepFlowProgressProps = {
  /** 0–100. */
  value: number
  /** Visible caption, e.g. "Step 2 of 5 · Price". */
  label: string
  /** Accessible name for the track. */
  trackLabel: string
}

/** Mobile progress strip under the header/context region. */
export function StepFlowProgress({
  value,
  label,
  trackLabel,
}: StepFlowProgressProps) {
  return (
    <Box
      w="full"
      px={{ base: 4, md: 6 }}
      py={3}
      bg="bg.surface"
      borderBottomWidth="1px"
      borderColor="border.default"
    >
      <ProgressBar value={value} label={label} trackLabel={trackLabel} />
    </Box>
  )
}

type StepFlowPanelProps = {
  title: string
  description?: string
  errorText?: string | null
  actions: Omit<StepFlowActionsProps, 'sticky'>
  children: ReactNode
}

/** Desktop step panel internals: scrollable heading + content, action bar. */
function StepFlowPanel({
  title,
  description,
  errorText,
  actions,
  children,
}: StepFlowPanelProps) {
  return (
    <Stack gap={0} w="full" h="full" minH={0}>
      <Stack
        gap={6}
        flex={1}
        minH={0}
        overflowY="auto"
        px={{ base: 4, md: 8, lg: 10 }}
        py={{ base: 5, md: 8 }}
        pb={{ base: 4, md: 8 }}
      >
        <StepFlowHeading title={title} description={description} />
        {errorText ? (
          <Text color="status.danger.fg" fontSize="sm">
            {errorText}
          </Text>
        ) : null}
        {children}
      </Stack>
      <StepFlowActions {...actions} sticky />
    </Stack>
  )
}

export type StepFlowLayoutProps = {
  /** Full-width strip above everything (e.g. email-verification banner). */
  banner?: ReactNode
  /** Flow header (e.g. exit + logo bar). Rendered on all breakpoints. */
  header?: ReactNode
  /** Desktop stepper rail content (lg+). */
  stepper: ReactNode
  /** Optional desktop context column (rendered right of the panel). */
  aside?: ReactNode
  /** Mobile-only region above the progress bar (e.g. task summary). */
  mobileTop?: ReactNode
  /** Mobile progress strip (compose with {@link StepFlowProgress}). */
  progress?: ReactNode
  /**
   * Custom mobile body (e.g. a step accordion). When omitted, the mobile body
   * is the step heading + `children` on a scrollable `bg.surface` region.
   */
  mobileBody?: ReactNode
  /** Active step heading. */
  title: string
  description?: string
  /** Save/submit error shown above the step content. */
  errorText?: string | null
  actions: Omit<StepFlowActionsProps, 'sticky'>
  children: ReactNode
}

export function StepFlowLayout({
  banner,
  header,
  stepper,
  aside,
  mobileTop,
  progress,
  mobileBody,
  title,
  description,
  errorText,
  actions,
  children,
}: StepFlowLayoutProps) {
  // JS breakpoint (not CSS hiding) so form state inside `children` is mounted
  // exactly once — the accordion/panel variants would otherwise double-mount.
  const showDesktopLayout =
    useBreakpointValue({ base: false, lg: true }, { fallback: 'base' }) ?? false

  return (
    <Stack gap={0} flex={1} minH="100dvh" bg="bg.subtle">
      {banner}
      {header}

      {!showDesktopLayout ? (
        <Stack flex={1} minH={0} gap={0}>
          {mobileTop}
          {progress}
          {mobileBody ? (
            <Box flex={1} minH={0} overflowY="auto">
              {mobileBody}
            </Box>
          ) : (
            <Box flex={1} minH={0} overflowY="auto" bg="bg.surface">
              <Stack gap={6} px={4} py={5} pb={4}>
                <StepFlowHeading title={title} description={description} />
                {errorText ? (
                  <Text color="status.danger.fg" fontSize="sm">
                    {errorText}
                  </Text>
                ) : null}
                {children}
              </Stack>
            </Box>
          )}
          <StepFlowActions {...actions} sticky />
        </Stack>
      ) : (
        <Box flex={1} minH={0} overflow="hidden">
          <Grid
            templateColumns={
              aside
                ? 'minmax(240px, 280px) minmax(0, 1fr) minmax(280px, 340px)'
                : 'minmax(280px, 320px) minmax(0, 1fr)'
            }
            gap={aside ? 6 : 8}
            maxW="7xl"
            mx="auto"
            w="full"
            h="full"
            px={8}
            py={8}
          >
            <Box pt={2} px={2} overflowY="auto" minH={0}>
              {stepper}
            </Box>
            <Box
              bg="bg.surface"
              borderRadius="2xl"
              boxShadow="e2"
              borderWidth="1px"
              borderColor="border.default"
              minH="640px"
              h="full"
              display="flex"
              flexDirection="column"
              overflow="hidden"
              minW={0}
            >
              <StepFlowPanel
                title={title}
                description={description}
                errorText={errorText}
                actions={actions}
              >
                {children}
              </StepFlowPanel>
            </Box>
            {aside ? (
              <Box minH={0} minW={0} h="full">
                {aside}
              </Box>
            ) : null}
          </Grid>
        </Box>
      )}
    </Stack>
  )
}
