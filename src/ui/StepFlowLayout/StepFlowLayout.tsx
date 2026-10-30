'use client'

import type { MouseEvent, ReactNode } from 'react'
import { useRef } from 'react'

import {
  Box,
  Grid,
  HStack,
  Stack,
  Text,
  VisuallyHidden,
  useBreakpointValue,
} from '@chakra-ui/react'
import { LuArrowLeft, LuArrowRight, LuX } from 'react-icons/lu'

import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'

import { Button } from '../Button/Button'
import { FormStack } from '../FormStack/FormStack'
import { IconButton } from '../IconButton/IconButton'
import { Link } from '../Link/Link'
import { Logo } from '../Logo/Logo'
import { ProgressBar } from '../ProgressBar'
import { useKeepFocusClearOfBar } from '../focusClearance'
import { STEP_FLOW_BAR_ATTR } from './stepFlowBar'

/**
 * SDL StepFlowLayout — the shared shell for multi-step flows (send a quote,
 * worker profile setup, task creation).
 *
 * Anatomy:
 * - Desktop (lg+): a page-column grid with a stepper rail, a raised step panel
 *   (scrollable heading + content, sticky action bar), and an optional
 *   context `aside` third column.
 * - Mobile: optional `mobileTop` context region, the `progress` bar, a
 *   scrollable body (heading + content on `bg.surface`), and the sticky
 *   action bar.
 *
 * The layout owns structure only — step state, validation, and navigation
 * stay in each flow's context/config. Compose the flow's own stepper and
 * progress data through the slots.
 *
 * Form spacing (FE-481, wiki Foundations-Form-Spacing): the step heading is the
 * title, then the description `formSpace.titleToSubtitle` (8) under it, and the
 * first field or block `headerToBody` (24) below that. The body is a
 * {@link FormStack}: a save error and every child are `fieldGap` (20) apart
 * (a flow with sections wraps them in `<FormStack gap="section">`, 32). The
 * action bar stays pinned so Continue is always reachable, but it has no
 * dividing line, and the body ends `bodyToAction` (20) above its buttons. The
 * Continue button is the form height (48).
 */

export type StepFlowHeaderProps = {
  /** The flow's name, e.g. "Post a task". */
  title: string
  /** Where Close goes (localised like every internal link). */
  exitHref: string
  /** Accessible name for Close. */
  closeLabel: string
  /** Runs before leaving; call `preventDefault()` to stay (e.g. unsaved changes). */
  onExit?: (event: MouseEvent<HTMLAnchorElement>) => void
}

/**
 * The flow's top bar: Close, the logo and the flow's name. Phones drop the
 * logo so the name fits. Close is a link, so leaving keeps the locale and
 * works without JS.
 */
export function StepFlowHeader({
  title,
  exitHref,
  closeLabel,
  onExit,
}: StepFlowHeaderProps) {
  return (
    <Box
      as="header"
      bg="bg.surface"
      borderBottomWidth="1px"
      borderColor="border.default"
    >
      <HStack
        gap={{ base: 2, md: 4 }}
        w="full"
        maxW={PAGE_CONTAINER_MAX_W}
        mx="auto"
        px={PAGE_GUTTER_X}
        minH={{ base: '56px', md: '64px' }}
      >
        <IconButton asChild aria-label={closeLabel} variant="ghost">
          <Link href={exitHref} onClick={onExit}>
            <LuX size={20} aria-hidden />
          </Link>
        </IconButton>
        <Logo
          containerProps={{
            flexShrink: 0,
            display: { base: 'none', md: 'flex' },
          }}
        />
        <Text
          flex={1}
          minW={0}
          fontSize="md"
          fontWeight={500}
          color="text.default"
          textAlign={{ base: 'left', md: 'center' }}
          truncate
        >
          {title}
        </Text>
        <Box
          display={{ base: 'none', md: 'block' }}
          w="44px"
          flexShrink={0}
          aria-hidden
        />
      </HStack>
    </Box>
  )
}

export type StepFlowHeadingProps = {
  title: string
  description?: string
  compact?: boolean
  /** Callback ref for the title, e.g. to focus it when the step changes. */
  headingRef?: (node: HTMLElement | null) => void
}

/**
 * Step title + supporting copy (`h1` of the flow screen). The description is
 * `titleToSubtitle` (8) under the title, and the first field is `headerToBody`
 * (24) below the block: the heading owns that 24, so put it in a plain
 * container, not a gapped stack.
 *
 * `compact` is the post-a-task map step's tighter header, so the map keeps half
 * the screen: its title and description are 4 apart, and the card around it
 * sets how far the first block sits (8 on phones, 16 from lg).
 */
export function StepFlowHeading({
  title,
  description,
  compact = false,
  headingRef,
}: StepFlowHeadingProps) {
  return (
    <Stack
      gap={compact ? 1 : 'form.titleToSubtitle'}
      mb={compact ? 0 : 'form.headerToBody'}
    >
      <Text
        as="h1"
        ref={headingRef}
        tabIndex={headingRef ? -1 : undefined}
        outline="none"
        fontSize={compact ? 'xl' : { base: '2xl', md: '3xl' }}
        fontWeight={500}
        lineHeight="short"
        color="text.default"
        letterSpacing={
          compact ? '-0.015em' : { base: '-0.02em', md: '-0.025em' }
        }
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
  /** Back's accessible name: the button shows only the arrow. */
  backLabel?: string
  continueLabel?: string
  continueLoading?: boolean
  /**
   * What the busy Continue is doing, such as "Uploading photo 2 of 3": shown
   * beside the spinner and read out politely as it changes. Without it the
   * button only spins.
   */
  continueLoadingText?: string
  /** Final submit action: drops the trailing arrow. */
  isFinal?: boolean
  onBack?: () => void
  onContinue?: () => void
  sticky?: boolean
}

/**
 * Back / Continue bar. Sticky on mobile; static inside the desktop panel.
 * Back is the arrow alone (44px), named by `backLabel`. Continue is the form
 * height (48).
 *
 * The bar has no dividing line and no padding above the buttons: the body above
 * it ends `bodyToAction` (20) from them (its own bottom padding), so the last
 * field is 20 above Continue at rest. Pinned (`sticky`), it can cover the foot
 * of a page that scrolls under it, so `globals.css` pads `<html>`'s scroll
 * (`STEP_FLOW_BAR_SCROLL_PADDING`): a field or chip that takes keyboard focus
 * stops 20 above it, not behind it. A tall field that is only partly under the
 * bar when it takes focus (the Description, the keyboard up) is scrolled clear
 * too: the padding alone does not move a partly visible control
 * (`useKeepFocusClearOfBar`).
 */
export function StepFlowActions({
  showBack = false,
  backLabel = 'Back',
  continueLabel = 'Continue',
  continueLoading = false,
  continueLoadingText,
  isFinal = false,
  onBack,
  onContinue,
  sticky = false,
}: StepFlowActionsProps) {
  const barRef = useRef<HTMLDivElement>(null)
  // Only a pinned bar covers anything: a static one sits after the content.
  useKeepFocusClearOfBar(barRef, sticky)
  return (
    <Box
      ref={barRef}
      // A pinned bar tells `globals.css` to keep focused controls above it.
      {...(sticky ? { [STEP_FLOW_BAR_ATTR]: '' } : {})}
      bg="bg.surface"
      px={{ base: 4, md: 8, lg: 10 }}
      pt={0}
      position={sticky ? 'sticky' : 'static'}
      bottom={0}
      zIndex={2}
      flexShrink={0}
      pb={{ base: 'calc(16px + env(safe-area-inset-bottom))', lg: 4 }}
    >
      <HStack justify="space-between" gap={3} w="full" align="center">
        {showBack ? (
          <IconButton
            type="button"
            aria-label={backLabel}
            color="text.link"
            flexShrink={0}
            onClick={onBack}
          >
            <LuArrowLeft size={20} aria-hidden />
          </IconButton>
        ) : (
          // Desktop only: holds Back's place (a zero-width spacer would
          // still take the 12px gap).
          <Box
            flexShrink={0}
            w="44px"
            display={{ base: 'none', lg: 'block' }}
          />
        )}
        <Button
          type="button"
          variant="primary"
          size="form"
          onClick={onContinue}
          loading={continueLoading}
          loadingText={continueLoadingText}
          // A busy label such as "正在上載第 2 張相片（共 3 張）" may take two
          // lines on a narrow phone rather than spill out of the button.
          whiteSpace="normal"
          h="auto"
          // minW 0, not full: flex fills the row without overflowing it.
          minW={{ base: 0, lg: 'auto' }}
          flex={{ base: 1, lg: 'none' }}
          ml="auto"
          px={6}
        >
          <HStack gap={2}>
            <span>{continueLabel}</span>
            {isFinal ? null : <LuArrowRight size={18} aria-hidden />}
          </HStack>
        </Button>
      </HStack>
      {/* Always in the page, so each new step is announced (politely, once). */}
      <VisuallyHidden aria-live="polite" aria-atomic="true">
        {continueLoading ? continueLoadingText : null}
      </VisuallyHidden>
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

type StepFlowBodyProps = {
  /** A save or submit error: the first field group, above the children. */
  errorText?: string | null
  children: ReactNode
}

/**
 * The step's fields: a save error, then each child, `fieldGap` (20) apart. A
 * flow with sections passes one `<FormStack gap="section">` as its child.
 */
export function StepFlowBody({ errorText, children }: StepFlowBodyProps) {
  return (
    <FormStack>
      {errorText ? (
        <Text color="status.danger.fg" fontSize="sm" role="alert">
          {errorText}
        </Text>
      ) : null}
      {children}
    </FormStack>
  )
}

type StepFlowPanelProps = {
  title: string
  description?: string
  headingRef?: StepFlowHeadingProps['headingRef']
  errorText?: string | null
  actions: Omit<StepFlowActionsProps, 'sticky'>
  children: ReactNode
}

/** Desktop step panel internals: scrollable heading + content, action bar. */
function StepFlowPanel({
  title,
  description,
  headingRef,
  errorText,
  actions,
  children,
}: StepFlowPanelProps) {
  return (
    <Stack gap={0} w="full" h="full" minH={0}>
      <Box
        flex={1}
        minH={0}
        overflowY="auto"
        px={{ base: 4, md: 8, lg: 10 }}
        pt={{ base: 5, md: 8 }}
        pb="form.bodyToAction"
      >
        <StepFlowHeading
          title={title}
          description={description}
          headingRef={headingRef}
        />
        <StepFlowBody errorText={errorText}>{children}</StepFlowBody>
      </Box>
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
  /** Active step heading. */
  title: string
  description?: string
  /** Callback ref for the step title (focus it when the step changes). */
  headingRef?: StepFlowHeadingProps['headingRef']
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
  title,
  description,
  headingRef,
  errorText,
  actions,
  children,
}: StepFlowLayoutProps) {
  // JS breakpoint (not CSS hiding) so form state inside `children` is mounted
  // exactly once: the phone and desktop bodies would otherwise both mount it.
  const showDesktopLayout =
    useBreakpointValue({ base: false, lg: true }, { fallback: 'base' }) ?? false

  return (
    <Stack gap={0} flex={1} minH="100dvh" bg="bg.canvas">
      {banner}
      {header}

      {!showDesktopLayout ? (
        <Stack flex={1} minH={0} gap={0}>
          {mobileTop}
          {progress}
          <Box flex={1} minH={0} overflowY="auto" bg="bg.surface">
            <Box px={4} pt={5} pb="form.bodyToAction">
              <StepFlowHeading
                title={title}
                description={description}
                headingRef={headingRef}
              />
              <StepFlowBody errorText={errorText}>{children}</StepFlowBody>
            </Box>
          </Box>
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
            maxW={PAGE_CONTAINER_MAX_W}
            mx="auto"
            w="full"
            h="full"
            px={PAGE_GUTTER_X}
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
                headingRef={headingRef}
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
