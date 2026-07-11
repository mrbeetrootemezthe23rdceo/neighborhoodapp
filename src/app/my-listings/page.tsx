'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import AppHeader from '@/components/AppHeader'
import ItemCard, { Item } from '@/components/ItemCard'

export default function MyListingsPage() {
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push('/login')
        return
      }
      setCheckingAuth(false)

      const { data, error } = await supabase
        .from('items')
        .select('id, title, category, condition, photo_url, listing_type, residents(name, apartment_no)')
        .eq('owner_id', userData.user.id)
        .order('created_at', { ascending: false })

      if (!error && data) setItems(data as unknown as Item[])
      setLoading(false)
    }
    load()
  }, [router])

  if (checkingAuth) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>
  }

  return (
    <div className="min-h-screen px-10 py-8 max-w-7xl mx-auto" style={{ background: '#FFE9D6' }}>
      <AppHeader />

      <h1 className="text-2xl font-bold mb-6" style={{ color: '#7C2D12' }}>My listings</h1>

      {loading ? (
        <p className="text-base" style={{ color: '#B45309' }}>Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-base" style={{ color: '#B45309' }}>
          You haven&apos;t posted anything yet.{' '}
          <a href="/list-item" className="font-medium cursor-pointer" style={{ color: '#C2410C' }}>List an item</a>
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
