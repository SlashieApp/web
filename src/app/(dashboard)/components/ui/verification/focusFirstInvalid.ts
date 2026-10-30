/**
 * After a check that belongs to a field fails: moves focus to the first control
 * marked invalid in the open dialog, once its error is drawn. A screen reader
 * then says the field with its error (the field's `aria-describedby`), and a
 * keyboard user is back in the field they have to fix.
 */
export function focusFirstInvalid(): void {
  window.setTimeout(() => {
    const dialog = document.querySelector('[role="dialog"]')
    const field = dialog?.querySelector<HTMLElement>('[aria-invalid="true"]')
    field?.focus()
  }, 0)
}
