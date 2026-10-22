import { bottomPinAnswerFailed } from './bottomPin.answerFailed'
import { bottomPinCancel } from './bottomPin.cancel'
import { bottomPinConfirmDone } from './bottomPin.confirmDone'
import { bottomPinConflict } from './bottomPin.conflict'
import { bottomPinMarkDone } from './bottomPin.markDone'
import { bottomPinReschedule } from './bottomPin.reschedule'
import { inboxEmpty } from './inbox.empty'
import { inboxError } from './inbox.error'
import { inboxList } from './inbox.list'
import { inboxLoading } from './inbox.loading'
import { inboxNoMatches } from './inbox.noMatches'
import { pinBooking } from './pin.booking'
import { pinClosed } from './pin.closed'
import { pinMyQuote } from './pin.myQuote'
import { pinQuotes } from './pin.quotes'
import { pinStatus } from './pin.status'
import { threadBlocked } from './thread.blocked'
import { threadLoadError } from './thread.loadError'
import { threadLoading } from './thread.loading'
import { threadLocked } from './thread.locked'
import { threadNone } from './thread.none'
import { threadNotFound } from './thread.notFound'
import { threadNotSelected } from './thread.notSelected'
import { threadOpen } from './thread.open'
import { threadSystem } from './thread.system'
import type {
  BottomPinViewConfig,
  BottomPinViewName,
  InboxViewConfig,
  InboxViewName,
  ThreadPinViewConfig,
  ThreadPinViewName,
  ThreadViewConfig,
  ThreadViewName,
} from './types'

export { getBottomPinView } from './getBottomPinView'
export { getInboxView } from './getInboxView'
export { getThreadPinView } from './getThreadPinView'
export { getThreadView } from './getThreadView'
export type {
  BottomPinViewConfig,
  BottomPinViewInput,
  BottomPinViewName,
  InboxViewConfig,
  InboxViewInput,
  InboxViewName,
  ThreadComposerNotice,
  ThreadPinViewConfig,
  ThreadPinViewName,
  ThreadQuery,
  ThreadViewConfig,
  ThreadViewInput,
  ThreadViewName,
} from './types'

export const INBOX_VIEWS: Record<InboxViewName, InboxViewConfig> = {
  'inbox.loading': inboxLoading,
  'inbox.error': inboxError,
  'inbox.empty': inboxEmpty,
  'inbox.noMatches': inboxNoMatches,
  'inbox.list': inboxList,
}

export const THREAD_VIEWS: Record<ThreadViewName, ThreadViewConfig> = {
  'thread.none': threadNone,
  'thread.loading': threadLoading,
  'thread.loadError': threadLoadError,
  'thread.notFound': threadNotFound,
  'thread.system': threadSystem,
  'thread.open': threadOpen,
  'thread.locked': threadLocked,
  'thread.notSelected': threadNotSelected,
  'thread.blocked': threadBlocked,
}

/** The top pin: information only. */
export const PIN_VIEWS: Record<ThreadPinViewName, ThreadPinViewConfig> = {
  'pin.quotes': pinQuotes,
  'pin.myQuote': pinMyQuote,
  'pin.booking': pinBooking,
  'pin.status': pinStatus,
  'pin.closed': pinClosed,
}

/** The bottom pin: what needs the viewer now, with its buttons. */
export const BOTTOM_PIN_VIEWS: Record<BottomPinViewName, BottomPinViewConfig> =
  {
    'bottomPin.reschedule': bottomPinReschedule,
    'bottomPin.cancel': bottomPinCancel,
    'bottomPin.markDone': bottomPinMarkDone,
    'bottomPin.confirmDone': bottomPinConfirmDone,
    'bottomPin.answerFailed': bottomPinAnswerFailed,
    'bottomPin.conflict': bottomPinConflict,
  }
