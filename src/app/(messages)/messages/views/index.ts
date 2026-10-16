import { inboxEmpty } from './inbox.empty'
import { inboxError } from './inbox.error'
import { inboxList } from './inbox.list'
import { inboxLoading } from './inbox.loading'
import { pinAnswer } from './pin.answer'
import { pinBooked } from './pin.booked'
import { pinClose } from './pin.close'
import { pinClosed } from './pin.closed'
import { pinConfirm } from './pin.confirm'
import { pinConflict } from './pin.conflict'
import { pinDone } from './pin.done'
import { pinNotSelected } from './pin.notSelected'
import { pinQuotes } from './pin.quotes'
import { pinQuoting } from './pin.quoting'
import { pinRequote } from './pin.requote'
import { pinStatus } from './pin.status'
import { pinWaiting } from './pin.waiting'
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
  InboxViewConfig,
  InboxViewName,
  ThreadPinViewConfig,
  ThreadPinViewName,
  ThreadViewConfig,
  ThreadViewName,
} from './types'

export { getInboxView } from './getInboxView'
export { getThreadPinView } from './getThreadPinView'
export { getThreadView } from './getThreadView'
export type {
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

export const PIN_VIEWS: Record<ThreadPinViewName, ThreadPinViewConfig> = {
  'pin.quotes': pinQuotes,
  'pin.status': pinStatus,
  'pin.quoting': pinQuoting,
  'pin.requote': pinRequote,
  'pin.booked': pinBooked,
  'pin.waiting': pinWaiting,
  'pin.answer': pinAnswer,
  'pin.close': pinClose,
  'pin.confirm': pinConfirm,
  'pin.conflict': pinConflict,
  'pin.done': pinDone,
  'pin.notSelected': pinNotSelected,
  'pin.closed': pinClosed,
}
