'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import AppHeader from '@/components/AppHeader'
import CategoryIcon from '@/components/CategoryIcon'
import ItemCard, { Item } from '@/components/ItemCard'
import { filterItems } from '@/lib/filterItems'

const CATEGORIES = [
  'Power Tools', 'Hand Tools', 'Garden', 'Kitchen',
  'Sports & Outdoor', 'Camping', 'Household', 'Electronics',
]

export default function HomePage() {
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [items, setItems] = useState<Item[]>([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/login')
      } else {
        setCheckingAuth(false)
      }
    })
  }, [router])

  useEffect(() => {
    if (checkingAuth) return

    async function loadItems() {
      const { data, error } = await supabase
        .from('items')
        .select('id, title, category, condition, photo_url, listing_type, residents(name, apartment_no)')
        .order('created_at', { ascending: false })

      if (!error && data) setItems(data as unknown as Item[])
      setLoadingItems(false)
    }

    loadItems()
  }, [checkingAuth])

  const filteredItems = filterItems(items, search, activeCategory)

  const offerItems = filteredItems.filter((item) => item.listing_type === 'offer')
  const requestItems = filteredItems.filter((item) => item.listing_type === 'request')

  if (checkingAuth) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>
  }

  return (
    <div className="min-h-screen px-10 py-8 max-w-7xl mx-auto" style={{ background: '#FFE9D6' }}>
      <AppHeader search={search} onSearchChange={setSearch} />

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-5 mb-10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className="flex flex-col items-center gap-2 cursor-pointer"
          >
            <div className={activeCategory === cat ? 'ring-2 rounded-2xl' : ''} style={activeCategory === cat ? { boxShadow: '0 0 0 2px #EA580C' } : {}}>
              <CategoryIcon category={cat} />
            </div>
            <span className="text-xs text-center leading-tight" style={{ color: '#9A3412' }}>{cat}</span>
          </button>
        ))}
      </div>

      {loadingItems ? (
        <p className="text-base" style={{ color: '#B45309' }}>Loading items...</p>
      ) : filteredItems.length === 0 ? (
        <p className="text-base" style={{ color: '#B45309' }}>No items found. Try a different search or category.</p>
      ) : (
        <>
          {requestItems.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-bold mb-4" style={{ color: '#111111' }}>Looking for</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {requestItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {offerItems.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-bold mb-4" style={{ color: '#111111' }}>Available to borrow</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {offerItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
