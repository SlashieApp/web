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
import {
  Button,
  Dropdown,
  HEADER_OVERLAY_BUTTON,
  IconButton,
  Link,
  useDropdownClose,
} from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { availableActions } from '../../helpers/taskDetailActions'
import { orderCounterpart } from '../../helpers/taskDetailUtils'
import type { TaskDetailAction } from '../../views'
import { OrderDoneDialog } from '../overview/OrderCloseControls'
import { OrderFailedDialog } from '../overview/OrderFailedDialog'
import {
  OrderCancelDialog,
  OrderRescheduleDialog,
  useOrderRequestOptions,
} from '../overview/OrderRequestDialogs'
import {
  CancelTaskDialog,
  WithdrawQuoteDialog,
} from '../overview/TaskConfirmDialogs'
import { useShareTask } from '../overview/shareTask'
import { TaskReportControl } from '../ui/TaskReportControl'

type TaskDialog =
  | 'reschedule'
  | 'cancel'
  | 'failed'
  | 'done'
  | 'cancelTask'
  | 'withdrawQuote'

/**
 * The dialogs behind the menu's actions: the booking ones, then Cancel task
 * and Withdraw quote, which have no booking behind them. They live outside
 * the menu, so they stay open after the phone menu (a drawer) closes.
 */
export function useTaskDialogs() {
  const options = useOrderRequestOptions()
  const [dialog, setDialog] = useState<TaskDialog | null>(null)
  const toggle = (kind: TaskDialog) => (open: boolean) =>
    setDialog(open ? kind : null)

  return {
    openDialog: setDialog,
    dialogs: (
      <>
        {options ? (
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
        ) : null}
        <CancelTaskDialog
          open={dialog === 'cancelTask'}
          onOpenChange={toggle('cancelTask')}
        />
        <WithdrawQuoteDialog
          open={dialog === 'withdrawQuote'}
          onOpenChange={toggle('withdrawQuote')}
        />
      </>
    ),
  }
}

const ACTION_DIALOG: Record<
  Exclude<TaskDetailAction, 'reportOtherParty' | 'withdrawRequest'>,
  TaskDialog
> = {
  reschedule: 'reschedule',
  cancelBooking: 'cancel',
  askToCancel: 'cancel',
  withdrawQuote: 'withdrawQuote',
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
  withdrawQuote: <LuUndo2 />,
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

/**
 * The view's actions (Reschedule, Cancel booking, Withdraw quote, ...),
 * listed first. A frozen booking (BE-108) refuses every change, so only
 * reporting the other person is left. Withdraw quote has no booking behind
 * it: it is for a worker whose quote is still pending once someone else is
 * booked or the booking ended (BE-116).
 */
function BookingActions({
  onDone,
  onOpenDialog,
}: {
  onDone: () => void
  onOpenDialog: (dialog: TaskDialog) => void
}) {
  const {
    view,
    task,
    myOrder,
    me,
    permissions,
    runOrderAction,
    orderActionPending,
  } = useTaskDetail()
  const t = useI11n(bag)
  if (!task) return null
  const actions = availableActions(view, permissions)
  const counterpartName = myOrder
    ? orderCounterpart(task, myOrder, permissions.isOwner, t).name
    : ''
  const request = myOrder ? orderRequestView(myOrder, me?.id) : null
  const withdraw =
    request?.kind === 'RESCHEDULE'
      ? 'cancelRescheduleRequest'
      : 'withdrawCancellation'
  const labels = {
    reschedule: t.requests.reschedule,
    cancelBooking: t.requests.cancelBooking,
    askToCancel: t.conflict.askToCancel,
    withdrawRequest: t.requests.withdraw,
    withdrawQuote: t.actions.withdrawQuote,
    switchToFailed: t.close.switchToFailed,
    switchToDone: t.close.switchToDone,
  }

  return (
    <>
      {actions.map((action) =>
        action === 'reportOtherParty' ? (
          myOrder ? (
            <ReportControl
              key={action}
              kind="user"
              targetId={
                permissions.isOwner
                  ? myOrder.workerUserId
                  : myOrder.customerUserId
              }
              targetTitle={counterpartName}
              variant="menu"
              onOpened={onDone}
            />
          ) : null
        ) : (
          <MenuAction
            key={action}
            icon={BOOKING_ICONS[action]}
            label={labels[action]}
            danger={
              action === 'cancelBooking' ||
              action === 'askToCancel' ||
              action === 'withdrawQuote'
            }
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
  /** Opens a dialog held outside the menu (`useTaskDialogs`). */
  onOpenDialog: (dialog: TaskDialog) => void
  /**
   * In the menu panel: a minimum width for the rows. The panel owns the padding
   * around them (Foundations-Form-Spacing, menus: 8), so there is none here.
   */
  packed?: boolean
}) {
  const close = onDone ?? (() => {})
  const t = useI11n(bag)
  const { task, permissions, cancelError } = useTaskDetail()
  const onShare = useShareTask(task?.title?.trim() || t.fallbackTask)

  if (!task) return null

  return (
    <Stack gap={1} minW={packed ? '220px' : undefined} w="full">
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
            onClick={() => {
              // The dialog asks before anything is cancelled.
              close()
              onOpenDialog('cancelTask')
            }}
          />
          {cancelError ? (
            <Text fontSize="sm" color="status.danger.fg" px={1} role="alert">
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
  onOpenDialog: (dialog: TaskDialog) => void
}) {
  const close = useDropdownClose()
  return (
    <TaskOverflowActions onDone={close} onOpenDialog={onOpenDialog} packed />
  )
}

/**
 * The options menu's three-dots button: the page header's option button on
 * the right of the bar (FE-458). `overlay`: floating over the map, as the
 * bar's buttons do.
 */
export function TaskHelpOverflowTrigger({
  overlay = false,
}: {
  overlay?: boolean
}) {
  const t = useI11n(bag)
  const { openDialog, dialogs } = useTaskDialogs()

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
            {...(overlay ? HEADER_OVERLAY_BUTTON : {})}
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
