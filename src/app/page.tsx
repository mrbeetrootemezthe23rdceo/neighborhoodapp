'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

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

  // Gate the page: only logged-in residents get past this
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

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !activeCategory || item.category === activeCategory
    return matchesSearch && matchesCategory
  })

  if (checkingAuth) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-white px-6 py-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-xl font-bold whitespace-nowrap">ToolShare</h1>
        <input
          type="text"
          placeholder="Search for a drill, ladder, tent..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-full bg-gray-100 px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <a href="/list-item" className="text-sm bg-black text-white rounded-full px-4 py-2 whitespace-nowrap">+ List item</a>
        <a href="/messages" className="text-sm text-gray-500 whitespace-nowrap">Messages</a>
        <button onClick={handleLogout} className="text-sm text-gray-500 whitespace-nowrap">
          Log out
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 mb-8">
        <button
          onClick={() => setActiveCategory(null)}
          className={`rounded-full px-4 py-2 text-sm whitespace-nowrap border ${
            activeCategory === null ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-2 text-sm whitespace-nowrap border ${
              activeCategory === cat ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loadingItems ? (
        <p className="text-gray-400 text-sm">Loading items...</p>
      ) : filteredItems.length === 0 ? (
        <p className="text-gray-400 text-sm">No items found. Try a different search or category.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <a key={item.id} href={`/item/${item.id}`} className="rounded-xl border border-gray-100 overflow-hidden">
              <div className="h-24 bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
                {item.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.photo_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  'No photo'
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">
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
