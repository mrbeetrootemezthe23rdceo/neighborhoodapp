'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import AppHeader from '@/components/AppHeader'
import CategoryIcon from '@/components/CategoryIcon'
import ItemCard, { Item } from '@/components/ItemCard'
import { filterItems } from '@/lib/filterItems'
import { CATEGORIES } from '@/lib/categories'

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
    return <div className="flex min-h-screen items-center justify-center text-body-mid">Loading...</div>
  }

  return (
    <div className="min-h-screen">
      <AppHeader search={search} onSearchChange={setSearch} />

      <div className="mx-auto max-w-7xl px-8 py-10">
        <div className="text-sm font-semibold tracking-[1px] text-primary uppercase">
          Neighborhood marketplace
        </div>
        <h1 className="mt-3 max-w-xl text-4xl leading-[1.1] font-medium text-ink sm:text-5xl">
          Borrow anything from your neighbors
        </h1>

        <div className="mt-8 grid grid-cols-4 gap-5 sm:grid-cols-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className="flex cursor-pointer flex-col items-center gap-2"
            >
              <CategoryIcon
                category={cat}
                className={activeCategory === cat ? 'outline outline-2 outline-primary' : ''}
              />
              <span className="text-center text-xs leading-tight text-body">{cat}</span>
            </button>
          ))}
        </div>

        <div className="mt-10">
          {loadingItems ? (
            <p className="text-base text-body-mid">Loading items...</p>
          ) : filteredItems.length === 0 ? (
            <p className="text-base text-body-mid">No items found. Try a different search or category.</p>
          ) : (
            <>
              {requestItems.length > 0 && (
                <div className="mb-10">
                  <h2 className="mb-4 text-xl font-semibold text-ink">Looking for</h2>
                  <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
                    {requestItems.map((item) => (
                      <ItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {offerItems.length > 0 && (
                <div className="mb-10">
                  <h2 className="mb-4 text-xl font-semibold text-ink">Available to borrow</h2>
                  <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
                    {offerItems.map((item) => (
                      <ItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
