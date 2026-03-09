import { create } from 'zustand'

export const useUIStore = create((set) => ({
  isMobileNavOpen: false,
  searchQuery: '',
  filters: {
    category: 'All',
    tag: 'Any',
    source: 'All',
  },
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilter: (name, value) =>
    set((state) => ({
      filters: { ...state.filters, [name]: value },
    })),
  toggleMobileNav: () =>
    set((state) => ({
      isMobileNavOpen: !state.isMobileNavOpen,
    })),
  closeMobileNav: () => set({ isMobileNavOpen: false }),
}))
