'use client'

import { Box, type SystemStyleObject } from '@chakra-ui/react'
import { createPortal } from 'react-dom'
import { LuEye } from 'react-icons/lu'

import { WEB_MQ } from '@/theme/breakpoints'
import { useIsBrowser } from '@/utils/useIsBrowser'
import { Button, Link, MOBILE_BOTTOM_NAV_MAX_W } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import type { TaskDetailMainCtaModel } from '../../helpers/taskDetailMainCtaModel'
import { TASK_DETAIL_TAB } from '../../helpers/taskDetailTabs'
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

function MainCtaControl({
  model,
  fill,
}: {
  model: TaskDetailMainCtaModel
  fill: boolean
}) {
  const { setActiveTab } = useTaskDetail()
  const scroll = model.scrollTo
    ? () => {
        const target = model.scrollTo
        if (!target) return
        setActiveTab(TASK_DETAIL_TAB.overview, {
          hash: target.hash,
          scrollId: target.scrollId,
        })
      }
    : undefined

  if (model.presentation === 'preview' || !model.content) {
    const label = (
      <>
        <LuEye />
        {model.buttonLabel}
      </>
    )
    if (model.href) {
      return (
        <Button
          asChild
          variant="primary"
          boxShadow="e3"
          w={fill ? 'full' : undefined}
        >
          <Link href={model.href} _hover={{ textDecoration: 'none' }}>
            {label}
          </Link>
        </Button>
      )
    }
    return (
      <Button
        type="button"
        variant="primary"
        boxShadow="e3"
        w={fill ? 'full' : undefined}
        onClick={scroll}
      >
        {label}
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
        onClick: scroll,
      }}
    />
  )
}

/**
 * Primary CTA from the provider. Compact (phone + tablet): fixed to the
 * viewport bottom. Web: aligned to the end of the tab intro. Button-only
 * uses the preview layout; text plus a button uses the quoted layout.
 */
export function TaskDetailMainCta() {
  const { statusReady, task, mainCta } = useTaskDetail()
  const isBrowser = useIsBrowser()

  if (!statusReady || !task || !mainCta) return null

  const webControl = <MainCtaControl model={mainCta} fill={false} />
  const pinControl = <MainCtaControl model={mainCta} fill />

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
    </>
  )
}
