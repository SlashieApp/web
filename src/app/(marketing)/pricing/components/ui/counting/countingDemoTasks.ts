import type { PhoneCopy } from '@/app/(marketing)/components/ui/landing/phone/phoneCopy'

/** A task a counting snippet quotes on: its title and the quote's price. */
export type DemoTask = { title: string; price: string }

/**
 * The demo tasks the snippets quote on, from the landing's phone copy. A plain
 * module, not the snippets' client file: the page calls it on the server, and
 * a function from a 'use client' file cannot be called there.
 */
export function countingDemoTasks(phone: PhoneCopy): DemoTask[] {
  const { hedge, wardrobe, paint, move } = phone.tasks
  return [hedge, wardrobe, paint, move].map((task) => ({
    title: task.title,
    price: task.price,
  }))
}
