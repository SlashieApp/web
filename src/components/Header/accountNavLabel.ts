import type bag from './i11n.json'

export type AccountMenuI11n = (typeof bag)['en']

export function accountNavLabel(
  copy: AccountMenuI11n,
  navId: string,
  fallback: string,
): string {
  const fromBag = copy.nav[navId as keyof AccountMenuI11n['nav']]
  return typeof fromBag === 'string' && fromBag.trim() ? fromBag : fallback
}
