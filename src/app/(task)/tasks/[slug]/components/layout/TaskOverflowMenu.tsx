'use client'

import { useI11n } from '@/i18n/useI11n'
import { Stack, Text } from '@chakra-ui/react'
import { type ReactNode, useState } from 'react'
import {
  LuCalendarClock,
  LuCalendarX,
  LuCircleAlert,
  LuCircleCheck,
  LuEllipsisVertical,
  LuPencil,
  LuRepeat,
  LuShare2,
  LuShieldCheck,
  LuTrash2,
  LuUndo2,
} from 'react-icons/lu'
import bag from '../../i11n.json'

import { ReportControl } from '@/content/trust/ReportControl'
import { SAFETY_HREF } from '@/utils/appRoutes'
import { orderRequestView } from '@/utils/orderHelpers'
import { repostTaskHref } from '@/utils/taskHandoff'
import { Button, Dropdown, IconButton, Link, useDropdownClose } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TASK_DETAIL_VIEWS, type TaskDetailAction } from '../../views'
import { OrderDoneDialog } from '../overview/OrderCloseControls'
import { OrderFailedDialog } from '../overview/OrderFailedDialog'
import {
  OrderCancelDialog,
  OrderRescheduleDialog,
  useOrderRequestOptions,
} from '../overview/OrderRequestDialogs'
import { useShareTask } from '../overview/shareTask'
import { TaskReportControl } from '../ui/TaskReportControl'

type BookingDialog = 'reschedule' | 'cancel' | 'failed' | 'done'

/**
 * The dialogs behind the booking actions. They live outside the menu, so
 * they stay open after the phone menu (a drawer) closes.
 */
export function useBookingDialogs() {
  const options = useOrderRequestOptions()
  const [dialog, setDialog] = useState<BookingDialog | null>(null)
  const toggle = (kind: BookingDialog) => (open: boolean) =>
    setDialog(open ? kind : null)

  return {
    openDialog: setDialog,
    dialogs: options ? (
      <>
        <OrderRescheduleDialog
          open={dialog === 'reschedule'}
          onOpenChange={toggle('reschedule')}
          counterpartName={options.counterpartName}
        />
        <OrderCancelDialog
          open={dialog === 'cancel'}
          onOpenChange={toggle('cancel')}
          counterpartName={options.counterpartName}
        />
        <OrderFailedDialog
          open={dialog === 'failed'}
          onOpenChange={toggle('failed')}
        />
        <OrderDoneDialog
          open={dialog === 'done'}
          onOpenChange={toggle('done')}
        />
      </>
    ) : null,
  }
}

const ACTION_DIALOG: Record<
  Exclude<TaskDetailAction, 'reportOtherParty' | 'withdrawRequest'>,
  BookingDialog
> = {
  reschedule: 'reschedule',
  cancelBooking: 'cancel',
  askToCancel: 'cancel',
  switchToFailed: 'failed',
  switchToDone: 'done',
}

const BOOKING_ICONS: Record<
  Exclude<TaskDetailAction, 'reportOtherParty'>,
  ReactNode
> = {
  reschedule: <LuCalendarClock />,
  cancelBooking: <LuCalendarX />,
  askToCancel: <LuCalendarX />,
  withdrawRequest: <LuUndo2 />,
  switchToFailed: <LuCircleAlert />,
  switchToDone: <LuCircleCheck />,
}

function MenuAction({
  icon,
  label,
  href,
  onClick,
  danger,
  loading,
}: {
  icon: React.ReactNode
  label: string
  href?: string
  onClick?: () => void
  danger?: boolean
  loading?: boolean
}) {
  const color = danger ? 'status.danger.fg' : undefined
  if (href) {
    return (
      <Button
        asChild
        variant="ghost"
        justifyContent="flex-start"
        w="full"
        color={color}
      >
        <Link href={href} _hover={{ textDecoration: 'none' }} onClick={onClick}>
          {icon}
          {label}
        </Link>
      </Button>
    )
  }
  return (
    <Button
      variant="ghost"
      justifyContent="flex-start"
      w="full"
      onClick={onClick}
      loading={loading}
      color={color}
    >
      {icon}
      {label}
    </Button>
  )
}

/** The view's booking actions (Reschedule, Cancel booking, ...), listed first. */
function BookingActions({
  onDone,
  onOpenDialog,
}: {
  onDone: () => void
  onOpenDialog: (dialog: BookingDialog) => void
}) {
  const { view, myOrder, me, permissions, runOrderAction, orderActionPending } =
    useTaskDetail()
  const t = useI11n(bag)
  const options = useOrderRequestOptions()
  if (!myOrder || !options) return null
  const request = orderRequestView(myOrder, me?.id)
  const withdraw =
    request?.kind === 'RESCHEDULE'
      ? 'cancelRescheduleRequest'
      : 'withdrawCancellation'
  const labels = {
    reschedule: t.requests.reschedule,
    cancelBooking: t.requests.cancelBooking,
    askToCancel: t.conflict.askToCancel,
    withdrawRequest: t.requests.withdraw,
    switchToFailed: t.close.switchToFailed,
    switchToDone: t.close.switchToDone,
  }

  return (
    <>
      {(TASK_DETAIL_VIEWS[view].actions ?? []).map((action) =>
        action === 'reportOtherParty' ? (
          <ReportControl
            key={action}
            kind="user"
            targetId={
              permissions.isOwner
                ? myOrder.workerUserId
                : myOrder.customerUserId
            }
            targetTitle={options.counterpartName}
            variant="menu"
            onOpened={onDone}
          />
        ) : (
          <MenuAction
            key={action}
            icon={BOOKING_ICONS[action]}
            label={labels[action]}
            danger={action === 'cancelBooking' || action === 'askToCancel'}
            loading={
              action === 'withdrawRequest' && orderActionPending === withdraw
            }
            onClick={() => {
              onDone()
              if (action === 'withdrawRequest') {
                void runOrderAction({ type: withdraw })
              } else onOpenDialog(ACTION_DIALOG[action])
            }}
          />
        ),
      )}
    </>
  )
}

export function TaskOverflowActions({
  onDone,
  onOpenDialog,
  packed = false,
}: {
  onDone?: () => void
  /** Opens a booking dialog held outside the menu (`useBookingDialogs`). */
  onOpenDialog: (dialog: BookingDialog) => void
  packed?: boolean
}) {
  const close = onDone ?? (() => {})
  const t = useI11n(bag)
  const { task, permissions, onCancelTask, cancelingTask, cancelError } =
    useTaskDetail()
  const onShare = useShareTask(task?.title?.trim() || t.fallbackTask)

  if (!task) return null

  return (
    <Stack
      gap={1}
      p={packed ? 1 : 0}
      minW={packed ? '220px' : undefined}
      w="full"
    >
      <BookingActions onDone={close} onOpenDialog={onOpenDialog} />
      <MenuAction
        icon={<LuShare2 />}
        label={t.actions.shareTask}
        onClick={() => {
          close()
          void onShare()
        }}
      />
      {permissions.canEditTask ? (
        <MenuAction
          icon={<LuPencil />}
          label={t.actions.editTask}
          href={`/tasks/${task.id}/edit`}
          onClick={close}
        />
      ) : null}
      {permissions.canRepostTask ? (
        <MenuAction
          icon={<LuRepeat />}
          label={t.actions.repostTask}
          href={repostTaskHref(task.id)}
          onClick={close}
        />
      ) : null}
      <MenuAction
        icon={<LuShieldCheck />}
        label={t.actions.payingMeetingSafely}
        href={SAFETY_HREF}
        onClick={close}
      />
      {permissions.isOwner ? null : (
        <TaskReportControl variant="menu" onOpened={close} />
      )}
      {permissions.canCancelTask ? (
        <>
          <MenuAction
            icon={<LuTrash2 />}
            label={t.actions.cancelTask}
            danger
            loading={cancelingTask}
            onClick={() => {
              // `onCancelTask` confirms before mutating; keep the menu open
              // state out of the way first.
              close()
              void onCancelTask()
            }}
          />
          {cancelError ? (
            <Text fontSize="sm" color="status.danger.fg" px={1}>
              {cancelError}
            </Text>
          ) : null}
        </>
      ) : null}
    </Stack>
  )
}

/**
 * Shared task-detail overflow menu. Holds every action: the view's booking
 * actions, share, owner edit/repost/cancel, safety, support, and report.
 */
export function TaskOverflowMenu({
  onOpenDialog,
}: {
  onOpenDialog: (dialog: BookingDialog) => void
}) {
  const close = useDropdownClose()
  return (
    <TaskOverflowActions onDone={close} onOpenDialog={onOpenDialog} packed />
  )
}

/**
 * Compact overflow: three-dots on the right of the sticky task title.
 */
export function TaskHelpOverflowTrigger() {
  const t = useI11n(bag)
  const { openDialog, dialogs } = useBookingDialogs()

  return (
    <>
      <Dropdown
        contentLabel={t.nav.taskOptionsAria}
        align="end"
        mobilePlacement="bottom"
        trigger={
          <IconButton
            type="button"
            variant="ghost"
            aria-label={t.nav.taskOptionsAria}
          >
            <LuEllipsisVertical />
          </IconButton>
        }
      >
        <TaskOverflowMenu onOpenDialog={openDialog} />
      </Dropdown>
      {dialogs}
    </>
  )
}
