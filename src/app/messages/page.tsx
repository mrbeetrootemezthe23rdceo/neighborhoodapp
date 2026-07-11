'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

type Conversation = {
  id: string
  requester_id: string
  owner_id: string
  items: { title: string } | null
  requester: { name: string } | null
  owner: { name: string } | null
}

export default function MessagesListPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push('/login')
        return
      }
      setCurrentUserId(userData.user.id)

      const { data } = await supabase
        .from('conversations')
        .select(`
          id, requester_id, owner_id,
          items(title),
          requester:residents!conversations_requester_id_fkey(name),
          owner:residents!conversations_owner_id_fkey(name)
        `)
        .order('created_at', { ascending: false })

      setConversations((data as unknown as Conversation[]) ?? [])
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>
  }

  return (
    <div className="min-h-screen px-8 py-10 max-w-lg mx-auto" style={{ background: '#FFE9D6' }}>
      <button onClick={() => router.push('/')} className="text-base mb-5 cursor-pointer" style={{ color: '#9A3412' }}>
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-7" style={{ color: '#7C2D12' }}>Messages</h1>

      {conversations.length === 0 ? (
        <p className="text-base" style={{ color: '#B45309' }}>No conversations yet.</p>
      ) : (
        <div className="space-y-3">
          {conversations.map((c) => {
            const otherPerson = c.requester_id === currentUserId ? c.owner : c.requester
            return (
              <Link
                key={c.id}
                href={`/messages/${c.id}`}
                className="block rounded-xl bg-white px-5 py-4 cursor-pointer"
                style={{ border: '1px solid #FED7AA' }}
              >
                <p className="text-base font-semibold" style={{ color: '#431407' }}>{c.items?.title ?? 'Item'}</p>
                <p className="text-sm mt-1" style={{ color: '#9A3412' }}>
                  with {otherPerson?.name ?? 'Neighbor'}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
