import type {
  MeQuery,
  MeWorkerSetupQuery,
  SaveWorkerSetupStepMutation,
} from '@codegen/schema'

import type { MeSnapshot } from '@/app/(auth)/store/user'

type SetupMe = MeWorkerSetupQuery['me']
type SavedWorker = SaveWorkerSetupStepMutation['saveWorkerSetupStep']

export function mergeMeWorkerSetupQuery(
  current: MeSnapshot | null,
  bootstrap: SetupMe,
): MeSnapshot {
  const base = current ?? (bootstrap as unknown as MeSnapshot)
  const worker = bootstrap.worker
    ? ({
        ...(base.worker ?? {}),
        ...bootstrap.worker,
        skills: bootstrap.worker.skills ?? base.worker?.skills ?? [],
        portfolioUrls:
          bootstrap.worker.portfolioUrls ?? base.worker?.portfolioUrls ?? [],
        location: bootstrap.worker.location ?? base.worker?.location,
        setupProgress:
          bootstrap.worker.setupProgress ?? base.worker?.setupProgress,
        membership: base.worker?.membership,
        earnings: base.worker?.earnings,
      } as NonNullable<MeQuery['me']['worker']>)
    : base.worker

  return {
    ...base,
    ...bootstrap,
    profile: {
      ...base.profile,
      ...bootstrap.profile,
    },
    worker,
  } as MeSnapshot
}

export function mergeSaveWorkerSetupIntoMe(
  current: MeSnapshot,
  saved: SavedWorker,
): MeSnapshot {
  const currentWorker = current.worker
  const nextWorker = {
    ...(currentWorker ?? {}),
    id: saved.id,
    legalName: saved.legalName ?? currentWorker?.legalName,
    bio: saved.bio ?? currentWorker?.bio,
    tagline: saved.tagline ?? currentWorker?.tagline,
    yearsExperience: saved.yearsExperience ?? currentWorker?.yearsExperience,
    skills: saved.skills ?? currentWorker?.skills ?? [],
    travelRadiusMiles:
      saved.travelRadiusMiles ?? currentWorker?.travelRadiusMiles,
    portfolioUrls: saved.portfolioUrls ?? currentWorker?.portfolioUrls ?? [],
    location: saved.location ?? currentWorker?.location,
    setupProgress: saved.setupProgress ?? currentWorker?.setupProgress,
    membership: currentWorker?.membership,
    earnings: currentWorker?.earnings,
    isVerified: currentWorker?.isVerified ?? false,
    tasksCompletedCount: currentWorker?.tasksCompletedCount,
    locationAddress: saved.location?.address ?? currentWorker?.locationAddress,
    locationLat: saved.location?.lat ?? currentWorker?.locationLat,
    locationLng: saved.location?.lng ?? currentWorker?.locationLng,
  } as NonNullable<MeQuery['me']['worker']>

  return {
    ...current,
    phoneVerified: saved.user?.phoneVerified ?? current.phoneVerified,
    profile: {
      ...current.profile,
      name: saved.profile?.name ?? current.profile?.name,
      avatarUrl: saved.profile?.avatarUrl ?? current.profile?.avatarUrl,
      contactNumber:
        saved.user?.profile?.contactNumber ?? current.profile?.contactNumber,
    },
    worker: nextWorker,
  }
}
