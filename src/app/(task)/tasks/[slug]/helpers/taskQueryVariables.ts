/** Variables for task detail/edit GraphQL operations (`Task`, `TaskForEdit`). */
export function taskQueryVariables(taskId: string) {
  return { id: taskId }
}
