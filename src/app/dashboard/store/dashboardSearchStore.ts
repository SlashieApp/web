import { create } from 'zustand'

type DashboardSearchState = {
  search: string
  setSearch: (value: string) => void
}

export const useDashboardSearchStore = create<DashboardSearchState>((set) => ({
  search: '',
  setSearch: (value) => set({ search: value }),
}))
