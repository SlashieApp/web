'use client'

import { Box, Stack, Text } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'
import { sdlFigure } from '@/theme/styles'
import { Modal, SlideToConfirm } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import bag from '../../i11n.json'

/**
 * Slide to mark the booking Done, with what Done means under it. `compact` is
 * the 48 tall track for the Done card's row; the dialog keeps the full one.
 */
function SlideDone({
  onMarked,
  compact = false,
}: {
  onMarked?: () => void
  compact?: boolean
}) {
  const { runOrderAction, orderActionPending } = useTaskDetail()
  const c = useI11n(bag).close
  const busy = orderActionPending != null

  return (
    <SlideToConfirm
      compact={compact}
      label={c.slideDone}
      armedLabel={c.tapAgainDone}
      loading={orderActionPending === 'markDone'}
      disabled={busy && orderActionPending !== 'markDone'}
      onConfirm={() =>
        void runOrderAction({ type: 'markDone' }).then((ok) => {
          if (ok) onMarked?.()
        })
      }
    />
  )
}

/** The Done meaning, one small muted line (12). */
function DoneMeaning({ align }: { align: 'start' | 'center' }) {
  const c = useI11n(bag).close
  return (
    <Text fontSize="xs" color="text.muted" textAlign={align}>
      {c.doneMeaning}
    </Text>
  )
}

/** The Done card is a container: the row below picks its layout from its width. */
const CARD_CSS = { containerType: 'inline-size' } as const

/**
 * One wrapping row, so the switch follows the content and never the other way
 * round: the status text keeps its natural width (the date stays on one line),
 * the slide takes the rest with 200 at least, and when the text, a gap (12) and
 * 200 do not fit, the slide wraps under the text at full width. At a 390
 * phone's bottom bar (342 inside) that is stacked; from about 360 inside it is
 * one row.
 */
const ROW_CSS = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
} as const

/**
 * The Done card: once the booked time has started and the viewer hasn't
 * acted, one row with the status and the date on the left and a compact slide
 * on the right (48 tall, at least 200 wide; wrapping under the text on very
 * small phones), and "what Done means" under it, 8 below. "Something went
 * wrong" is the first entry of Help & actions. Switching after acting is there
 * too (`OrderDoneDialog`, `OrderFailedDialog`). Nothing while the booking is
 * frozen by a suspension (BE-108).
 */
export function OrderCloseCard() {
  const { orderClose, permissions, mainCta } = useTaskDetail()

  if (!orderClose?.canClose || !permissions.showOrderActions) return null

  const content = mainCta?.presentation === 'close' ? mainCta.content : null

  return (
    <Box
      data-order-close-card
      w="full"
      bg="bg.surface"
      borderRadius="xl"
      boxShadow="e3"
      p={4}
      css={CARD_CSS}
    >
      <Box gap={3} css={ROW_CSS}>
        {content ? (
          <Stack gap={0} flex="0 1 auto" maxW="full">
            <Text fontSize="xs" fontWeight={500} color="text.muted">
              {content.eyebrow}
            </Text>
            <Text {...sdlFigure}>{content.value}</Text>
          </Stack>
        ) : null}
        <Box flex="1 1 200px" minW="200px">
          <SlideDone compact />
        </Box>
      </Box>
      <Box mt={2}>
        <DoneMeaning align="start" />
      </Box>
    </Box>
  )
}

/** After marking Failed: change your mind and slide to mark it Done. */
export function OrderDoneDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const c = useI11n(bag).close

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={c.switchToDone}
      size="sm"
    >
      {/* The slide is the action and "what Done means" is its helper line:
          4 under it (`formSpace.controlToHelper`), as under any control. */}
      <Stack gap="form.controlToHelper">
        <SlideDone onMarked={() => onOpenChange(false)} />
        <DoneMeaning align="center" />
      </Stack>
    </Modal>
  )
}
