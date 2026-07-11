export type FilterableItem = {
  title: string
  category: string
}

/**
 * Filters a list of items by a search term (matched against the title,
 * case-insensitive) and an optional category. Passing `null` for
 * activeCategory means "show all categories".
 */
export function filterItems<T extends FilterableItem>(
  items: T[],
  search: string,
  activeCategory: string | null
): T[] {
  return items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !activeCategory || item.category === activeCategory
    return matchesSearch && matchesCategory
  })
}
