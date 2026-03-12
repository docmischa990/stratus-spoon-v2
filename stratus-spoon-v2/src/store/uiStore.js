import { create } from 'zustand'

export const useUIStore = create((set) => ({
  isMobileNavOpen: false,
  searchQuery: '',
  filters: {
    category: 'All',
    tag: 'Any',
    source: 'All',
    cuisine: 'Any',
    diet: 'Any',
    maxReadyTime: 'Any',
    sort: 'popularity',
  },
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilter: (name, value) =>
    set((state) => ({
      filters: { ...state.filters, [name]: value },
    })),
  resetRecipeFilters: () =>
    set({
      filters: {
        category: 'All',
        tag: 'Any',
        source: 'All',
        cuisine: 'Any',
        diet: 'Any',
        maxReadyTime: 'Any',
        sort: 'popularity',
      },
    }),
  toggleMobileNav: () =>
    set((state) => ({
      isMobileNavOpen: !state.isMobileNavOpen,
    })),
  closeMobileNav: () => set({ isMobileNavOpen: false }),
}))
