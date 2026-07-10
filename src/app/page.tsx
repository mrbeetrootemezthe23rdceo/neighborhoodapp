'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import AppHeader from '@/components/AppHeader'
import CategoryIcon from '@/components/CategoryIcon'

const CATEGORIES = [
  'Power Tools', 'Hand Tools', 'Garden', 'Kitchen',
  'Sports & Outdoor', 'Camping', 'Household', 'Electronics',
]

type Item = {
  id: string
  title: string
  category: string
  condition: string | null
  photo_url: string | null
  residents: { name: string; apartment_no: string } | null
}

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
        .select('id, title, category, condition, photo_url, residents(name, apartment_no)')
        .order('created_at', { ascending: false })

      if (!error && data) setItems(data as unknown as Item[])
      setLoadingItems(false)
    }

    loadItems()
  }, [checkingAuth])

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !activeCategory || item.category === activeCategory
    return matchesSearch && matchesCategory
  })

  if (checkingAuth) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-white px-10 py-8 max-w-7xl mx-auto">
      <AppHeader search={search} onSearchChange={setSearch} />

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-5 mb-10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className="flex flex-col items-center gap-2 cursor-pointer"
          >
            <div className={activeCategory === cat ? 'ring-2 ring-black rounded-2xl' : ''}>
              <CategoryIcon category={cat} />
            </div>
            <span className="text-xs text-gray-600 text-center leading-tight">{cat}</span>
          </button>
        ))}
      </div>

      {loadingItems ? (
        <p className="text-gray-400 text-base">Loading items...</p>
      ) : filteredItems.length === 0 ? (
        <p className="text-gray-400 text-base">No items found. Try a different search or category.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {filteredItems.map((item) => (
            <a key={item.id} href={`/item/${item.id}`} className="rounded-xl border border-gray-100 overflow-hidden block hover:border-gray-300 transition-colors">
              <div className="h-32 bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
                {item.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.photo_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <CategoryIcon category={item.category} size={48} />
                )}
              </div>
              <div className="p-4">
                <p className="text-base font-semibold">{item.title}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {item.category} · {item.residents?.apartment_no ?? 'Unknown'}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
