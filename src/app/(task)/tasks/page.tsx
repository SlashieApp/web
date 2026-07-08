import { redirect } from 'next/navigation'

/** Task browse moved to the unified map-first search surface. */
export default function TasksBrowseRedirect() {
  redirect('/search?mode=tasks')
}
