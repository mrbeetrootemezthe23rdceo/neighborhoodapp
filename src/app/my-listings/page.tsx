'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import AppHeader from '@/components/AppHeader'
import ItemCard, { Item } from '@/components/ItemCard'
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr'

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
    return <div className="flex min-h-screen items-center justify-center text-body-mid">Loading...</div>
  }

  const requestItems = items.filter((item) => item.listing_type === 'request')
  const offerItems = items.filter((item) => item.listing_type === 'offer')

  return (
    <div className="min-h-screen">
      <AppHeader />

      <div className="mx-auto max-w-7xl px-8 py-10">
        <button
          onClick={() => router.push('/')}
          className="mb-5 inline-flex cursor-pointer items-center gap-1.5 text-sm text-body"
        >
          <ArrowLeftIcon size={16} />
          Back
        </button>

        <h1 className="mb-6 text-2xl font-semibold text-ink">My listings</h1>

        {loading ? (
          <p className="text-base text-body-mid">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-base text-body-mid">
            You haven&apos;t posted anything yet.{' '}
            <Link href="/list-item" className="cursor-pointer font-semibold text-primary">
              List an item
            </Link>
          </p>
        ) : (
          <>
            {requestItems.length > 0 && (
              <div className="mb-10">
                <h2 className="mb-4 text-xl font-semibold text-ink">Things I&apos;m looking for</h2>
                <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
                  {requestItems.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {offerItems.length > 0 && (
              <div className="mb-10">
                <h2 className="mb-4 text-xl font-semibold text-ink">Things I&apos;m lending</h2>
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
  )
}
