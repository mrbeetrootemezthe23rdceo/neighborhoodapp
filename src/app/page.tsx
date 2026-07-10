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
  listing_type: 'offer' | 'request'
  residents: { name: string; apartment_no: string } | null
}

function ItemCard({ item }: { item: Item }) {
  return (
    <a
      href={`/item/${item.id}`}
      className="rounded-xl overflow-hidden block transition-colors bg-white"
      style={{
        border: item.listing_type === 'request' ? '2px dashed #FDBA74' : '1px solid #FED7AA',
      }}
    >
      <div className="h-32 flex items-center justify-center text-xs relative" style={{ background: '#FFF3E8' }}>
        {item.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.photo_url} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <CategoryIcon category={item.category} size={48} />
        )}
        {item.listing_type === 'request' && (
          <span
            className="absolute top-2 left-2 text-white text-[11px] px-2.5 py-1 rounded-full"
            style={{ backgroundColor: '#9A3412' }}
          >
            Looking for
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-base font-semibold" style={{ color: '#431407' }}>{item.title}</p>
        <p className="text-sm mt-1" style={{ color: '#9A3412' }}>
          {item.category} · {item.residents?.apartment_no ?? 'Unknown'}
        </p>
      </div>
    </a>
  )
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
        .select('id, title, category, condition, photo_url, listing_type, residents(name, apartment_no)')
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
              <h2 className="text-xl font-bold mb-4" style={{ color: '#7C2D12' }}>Looking for</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {requestItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {offerItems.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-bold mb-4" style={{ color: '#7C2D12' }}>Available to borrow</h2>
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
