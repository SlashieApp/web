import type { WorkerSetupViewConfig } from './types'

/** Name, private date of birth and a profile photo. */
export const setupAbout: WorkerSetupViewConfig = {
  layout: 'screen',
  screen: 'about',
  subSteps: ['profile.details', 'profile.photo'],
  sections: ['name', 'dateOfBirth', 'photo'],
  primary: 'continue',
}
