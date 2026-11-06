import { expect } from 'storybook/test'

const near = (actual: number, expected: number) =>
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(0.5)

/** The parts of one My Tasks row, found by structure. */
export function rowParts(canvasElement: HTMLElement, title: string) {
  const pills = canvasElement.querySelector<HTMLElement>(
    '[data-testid="my-task-pills"]',
  )
  if (!pills) throw new Error('no pill line')
  const column = pills.parentElement as HTMLElement
  const photo = column.previousElementSibling as HTMLElement
  const titleLink = [...canvasElement.querySelectorAll('a')].find(
    (link) => link.textContent === title,
  )
  const titleText = titleLink?.parentElement
  if (!titleText) throw new Error(`no title link ${title}`)
  const line = pills.nextElementSibling as HTMLElement | null
  const first = column.firstElementChild as HTMLElement
  const time = first === titleText ? undefined : first
  return { photo, column, titleText, pills, line, time }
}

/**
 * Every row, in every section, reads the same: a 56 square photo (or the
 * icon), then the title, the pills 4 below it with 8 between them, and the
 * muted line; Upcoming's time line is above the title.
 */
export async function expectRowAnatomy(
  canvasElement: HTMLElement,
  title: string,
  options: { time?: boolean; pills: number } = { pills: 2 },
) {
  const { photo, column, titleText, pills, line, time } = rowParts(
    canvasElement,
    title,
  )
  const box = photo.getBoundingClientRect()
  near(box.width, 56)
  near(box.height, 56)
  // The photo sits left of the text, 12 apart.
  near(column.getBoundingClientRect().left - box.right, 12)
  const titleBox = titleText.getBoundingClientRect()
  const pillBox = pills.getBoundingClientRect()
  near(pillBox.top - titleBox.bottom, 4)
  await expect(pills.children).toHaveLength(options.pills)
  const kids = [...pills.children].map((el) => el.getBoundingClientRect())
  for (let i = 1; i < kids.length; i++) {
    near(kids[i].left - kids[i - 1].right, 8)
  }
  if (line) {
    await expect(line.getBoundingClientRect().top).toBeGreaterThan(
      pillBox.bottom - 1,
    )
  }
  if (options.time) {
    await expect(time).toBeDefined()
    await expect(time?.getBoundingClientRect().bottom ?? 0).toBeLessThanOrEqual(
      titleBox.top + 0.5,
    )
  } else {
    await expect(time).toBeUndefined()
  }
}
