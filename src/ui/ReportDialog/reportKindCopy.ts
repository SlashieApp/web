import type bag from './i11n.json'
import type { ReportTargetKind } from './reportFormSchema'

type ReportCopy = (typeof bag)['en']

export function reportKindPhrases(kind: ReportTargetKind, t: ReportCopy) {
  if (kind === 'worker') {
    return {
      label: t.reportWorker,
      aria: t.reportWorkerAria,
      title: t.titleWorker,
      subject: t.subjectWorker,
    }
  }
  if (kind === 'user') {
    return {
      label: t.reportUser,
      aria: t.reportUserAria,
      title: t.titleUser,
      subject: t.subjectUser,
    }
  }
  if (kind === 'review') {
    return {
      label: t.reportReview,
      aria: t.reportReviewAria,
      title: t.titleReview,
      subject: t.subjectReview,
    }
  }
  return {
    label: t.reportTask,
    aria: t.reportTaskAria,
    title: t.titleTask,
    subject: t.subjectTask,
  }
}
