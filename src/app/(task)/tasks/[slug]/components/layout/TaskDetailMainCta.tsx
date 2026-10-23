'use client'

import { Box, Stack, type SystemStyleObject, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { IconType } from 'react-icons'
import { LuEye, LuLogIn, LuRepeat, LuRotateCcw, LuSearch } from 'react-icons/lu'

import { WEB_MQ } from '@/theme/breakpoints'
import { useIsBrowser } from '@/utils/useIsBrowser'
import { Button, Link, MOBILE_BOTTOM_NAV_MAX_W } from '@ui'

import { downloadOrderReceiptPdf } from '@/content/reviews/downloadOrderReceipt'
import { useI11n } from '@/i18n/useI11n'
import { showAppToast } from '@/utils/appToast'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import type { TaskDetailMainCtaModel } from '../../helpers/taskDetailMainCtaModel'
import bag from '../../i11n.json'
import type { TaskDetailPrimaryAction } from '../../views'
import { OrderCloseControls } from '../overview/OrderCloseControls'
import { ReopenTaskDialog } from '../overview/ReopenTaskDialog'
import { TaskDetailSplitCta } from '../ui/TaskDetailSplitCta'
import { Reveal } from './Reveal'

const PIN_FADE_HEIGHT =
  'calc(8.5rem + env(safe-area-inset-bottom, 0px))' as const

const surfaceVar = 'var(--chakra-colors-bg-surface, #FFFFFF)'

const reducedTransparencyQuery =
  '@media (prefers-reduced-transparency: reduce), (prefers-reduced-motion: reduce)' as const

const PIN_FADE_MASK = 'linear-gradient(to top, #000 45%, transparent 100%)'

/**
 * Blurred white wash that dissolves upward so scrolling cards fade under
 * the pin. The mask feathers the blur so it has no hard top edge.
 */
const pinFadeCss: SystemStyleObject = {
  background: `linear-gradient(to top, ${surfaceVar} 0%, color-mix(in srgb, ${surfaceVar} 80%, transparent) 38%, color-mix(in srgb, ${surfaceVar} 36%, transparent) 68%, transparent 100%)`,
  backdropFilter: 'blur(10px)',
  maskImage: PIN_FADE_MASK,
  WebkitMaskImage: PIN_FADE_MASK,
  [reducedTransparencyQuery]: {
    background: `linear-gradient(to top, ${surfaceVar} 0%, color-mix(in srgb, ${surfaceVar} 92%, transparent) 55%, transparent 100%)`,
    backdropFilter: 'none',
  },
}

function TaskDetailMainCtaFade() {
  return (
    <Box
      aria-hidden
      data-task-detail-main-cta-fade
      position="absolute"
      insetX={0}
      bottom={0}
      h={PIN_FADE_HEIGHT}
      pointerEvents="none"
      css={pinFadeCss}
    />
  )
}

/** Icons for the button-only actions. */
const BUTTON_ICONS: Partial<Record<TaskDetailPrimaryAction, IconType>> = {
  preview: LuEye,
  signInToQuote: LuLogIn,
  repost: LuRepeat,
  reopen: LuRotateCcw,
  browseTasks: LuSearch,
}

/** The action renders as a lone button (no eyebrow and value card). */
export function isButtonOnlyMainCta(model: TaskDetailMainCtaModel): boolean {
  return (
    model.presentation !== 'close' &&
    (model.presentation === 'button' || !model.content)
  )
}

/** Downloads the receipt for the viewer's booking, in place. */
function useReceiptDownload() {
  const { myOrder } = useTaskDetail()
  const reviews = useI11n(bag).reviews
  return () => {
    if (!myOrder) return
    void downloadOrderReceiptPdf(myOrder.id).catch(() => {
      showAppToast({ title: reviews.receiptFailed, type: 'error' })
    })
  }
}

/**
 * The main action as a small button on its own, for a `quoted` or `button`
 * model (Messages' pinned card shows the facts itself).
 */
export function MainCtaButton({ model }: { model: TaskDetailMainCtaModel }) {
  const onReceipt = useReceiptDownload()
  if (model.receipt) {
    return (
      <Button type="button" size="sm" variant="secondary" onClick={onReceipt}>
        {model.buttonLabel}
      </Button>
    )
  }
  return (
    <Button asChild size="sm" variant="secondary">
      <Link href={model.href ?? ''} _hover={{ textDecoration: 'none' }}>
        {model.buttonLabel}
      </Link>
    </Button>
  )
}

function MainCtaControl({
  model,
  fill,
  onReopen,
}: {
  model: TaskDetailMainCtaModel
  fill: boolean
  /** Opens the Reopen task confirm, which the page holds once. */
  onReopen: () => void
}) {
  const onReceipt = useReceiptDownload()

  if (model.presentation === 'close') {
    return (
      <Box
        w="full"
        bg="bg.surface"
        borderRadius="xl"
        boxShadow="e3"
        borderWidth="1px"
        borderColor="border.default"
        p={4}
      >
        <Stack gap={3}>
          {model.content ? (
            <Stack gap={0}>
              <Text fontSize="xs" fontWeight={700} color="text.muted">
                {model.content.eyebrow}
              </Text>
              <Text fontWeight={700}>{model.content.value}</Text>
            </Stack>
          ) : null}
          <OrderCloseControls />
        </Stack>
      </Box>
    )
  }

  if (isButtonOnlyMainCta(model) || !model.content) {
    const Icon = BUTTON_ICONS[model.action]
    if (model.action === 'reopen') {
      return (
        <Button
          type="button"
          variant="primary"
          boxShadow="e3"
          w={fill ? 'full' : undefined}
          onClick={onReopen}
        >
          {Icon ? <Icon aria-hidden /> : null}
          {model.buttonLabel}
        </Button>
      )
    }
    return (
      <Button
        asChild
        variant="primary"
        boxShadow="e3"
        w={fill ? 'full' : undefined}
      >
        <Link href={model.href ?? ''} _hover={{ textDecoration: 'none' }}>
          {Icon ? <Icon aria-hidden /> : null}
          {model.buttonLabel}
        </Link>
      </Button>
    )
  }

  return (
    <TaskDetailSplitCta
      eyebrow={model.content.eyebrow}
      value={model.content.value}
      meta={model.content.meta}
      fullWidth={fill || model.presentation === 'quoted'}
      action={{
        label: model.buttonLabel,
        href: model.href,
        onClick: model.receipt ? onReceipt : undefined,
      }}
    />
  )
}

/**
 * The view's primary action. Compact (phone + tablet): fixed to the viewport
 * bottom. Web: right end of the title row. Reopen task asks first, in one
 * dialog for both.
 */
export function TaskDetailMainCta() {
  const { mainCta } = useTaskDetail()
  const isBrowser = useIsBrowser()
  const [reopenOpen, setReopenOpen] = useState(false)

  if (!mainCta) return null

  const onReopen = () => setReopenOpen(true)
  const webControl = (
    <MainCtaControl model={mainCta} fill={false} onReopen={onReopen} />
  )
  const pinControl = <MainCtaControl model={mainCta} fill onReopen={onReopen} />

  const compactPin = (
    <Box
      data-task-detail-main-cta
      data-task-detail-pin={mainCta.presentation}
      css={{
        display: 'block',
        [`@media screen and ${WEB_MQ}`]: { display: 'none' },
      }}
      position="fixed"
      insetX={0}
      bottom={0}
      zIndex={25}
      pointerEvents="none"
    >
      <TaskDetailMainCtaFade />
      <Box
        position="relative"
        px={2}
        pt={2}
        pb="calc(10px + env(safe-area-inset-bottom, 0px))"
      >
        <Reveal>
          <Box
            pointerEvents="auto"
            display="flex"
            flexDirection="column"
            alignItems="stretch"
            w="full"
            maxW={MOBILE_BOTTOM_NAV_MAX_W}
            mx="auto"
          >
            {pinControl}
          </Box>
        </Reveal>
      </Box>
    </Box>
  )

  return (
    <>
      <Box
        data-task-detail-main-cta
        data-task-detail-pin={mainCta.presentation}
        display={{ base: 'none', lg: 'flex' }}
        justifyContent="flex-end"
        w="full"
        minW={0}
      >
        {webControl}
      </Box>
      {isBrowser ? createPortal(compactPin, document.body) : compactPin}
      {mainCta.action === 'reopen' ? (
        <ReopenTaskDialog open={reopenOpen} onOpenChange={setReopenOpen} />
      ) : null}
    </>
  )
}
