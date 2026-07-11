import { describe, it, expect } from 'vitest'
import { filterItems } from './filterItems'

const sampleItems = [
  { title: 'Cordless drill', category: 'Power Tools' },
  { title: 'Extension ladder', category: 'Garden' },
  { title: '4-person tent', category: 'Camping' },
]

describe('filterItems', () => {
  it('returns all items when search is empty and category is null', () => {
    const result = filterItems(sampleItems, '', null)
    expect(result).toHaveLength(3)
  })

  it('filters by search term, case-insensitively', () => {
    const result = filterItems(sampleItems, 'DRILL', null)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Cordless drill')
  })

  it('filters by category', () => {
    const result = filterItems(sampleItems, '', 'Garden')
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Extension ladder')
  })

  it('applies both search and category together', () => {
    const result = filterItems(sampleItems, 'tent', 'Camping')
    expect(result).toHaveLength(1)
  })

  it('returns an empty array when nothing matches', () => {
    const result = filterItems(sampleItems, 'nonexistent item', null)
    expect(result).toHaveLength(0)
  })
})
