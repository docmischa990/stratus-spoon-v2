import { useUIStore } from '@/store/uiStore'

export function SearchBar() {
  const searchQuery = useUIStore((state) => state.searchQuery)
  const setSearchQuery = useUIStore((state) => state.setSearchQuery)

  return (
    <label className="card-base flex items-center gap-3 px-4 py-3">
      <span className="text-lg text-text-muted" aria-hidden="true">
        Search
      </span>
      <input
        type="search"
        className="w-full bg-transparent text-sm text-text outline-none placeholder:text-text-muted/70"
        placeholder="Search recipes"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
      />
    </label>
  )
}
