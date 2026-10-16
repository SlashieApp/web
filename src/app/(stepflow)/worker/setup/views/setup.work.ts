import type { WorkerSetupViewConfig } from './types'

/** Main trade, skills, years of experience and optional qualifications. */
export const setupWork: WorkerSetupViewConfig = {
  layout: 'screen',
  screen: 'work',
  subSteps: ['services.skills', 'services.experience'],
  sections: ['trade', 'skills', 'experience', 'qualifications'],
  primary: 'continue',
}
