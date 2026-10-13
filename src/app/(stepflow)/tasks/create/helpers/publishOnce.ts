/**
 * Runs `publish` unless a publish is already running or has succeeded
 * (FE-213). The lock is synchronous, so a double tap can't slip past a
 * re-render, and a success keeps it held while the page navigates away.
 * A failure (or throw) releases it so the poster can try again.
 */
export async function publishOnce(
  lock: { current: boolean },
  publish: () => Promise<boolean>,
): Promise<void> {
  if (lock.current) return
  lock.current = true
  let published = false
  try {
    published = await publish()
  } finally {
    if (!published) lock.current = false
  }
}
