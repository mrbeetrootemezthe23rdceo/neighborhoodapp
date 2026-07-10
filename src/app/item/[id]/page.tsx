'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type Item = {
  id: string
  title: string
  description: string | null
  category: string
  condition: string | null
  photo_url: string | null
  owner_id: string
  residents: { name: string; apartment_no: string } | null
}

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [item, setItem] = useState<Item | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push('/login')
        return
      }
      setCurrentUserId(userData.user.id)

      const { data, error } = await supabase
        .from('items')
        .select('id, title, description, category, condition, photo_url, owner_id, residents(name, apartment_no)')
        .eq('id', id)
        .single()

      if (!error && data) setItem(data as unknown as Item)
      setLoading(false)
    }
    load()
  }, [id, router])

  async function handleRequestToBorrow(e: React.FormEvent) {
    e.preventDefault()
    if (!item || !currentUserId) return

    setSending(true)
    setError(null)

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('item_id', item.id)
      .eq('requester_id', currentUserId)
      .maybeSingle()

    let conversationId = existing?.id

    if (!conversationId) {
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          item_id: item.id,
          requester_id: currentUserId,
          owner_id: item.owner_id,
        })
        .select('id')
        .single()

      if (convError || !newConversation) {
        setSending(false)
        setError(convError?.message ?? 'Could not start conversation.')
        return
      }
      conversationId = newConversation.id
    }

    const { error: msgError } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      body: message,
    })

    setSending(false)

    if (msgError) {
      setError(msgError.message)
      return
    }

    router.push(`/messages/${conversationId}`)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>
  }

  if (!item) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Item not found.</div>
  }

  const isOwnItem = item.owner_id === currentUserId

  return (
    <div className="min-h-screen bg-white px-6 py-8 max-w-md mx-auto">
      <button onClick={() => router.push('/')} className="text-sm text-gray-500 mb-4">
        ← Back
      </button>

      <div className="rounded-2xl overflow-hidden bg-gray-100 h-56 flex items-center justify-center text-gray-300 text-sm mb-4">
        {item.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.photo_url} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          'No photo'
        )}
      </div>

      <h1 className="text-xl font-bold">{item.title}</h1>
      <p className="text-sm text-gray-500 mt-1">
        {item.category} · {item.condition ?? 'Condition not specified'}
      </p>
      <p className="text-sm text-gray-500 mt-1">
        Owned by {item.residents?.name ?? 'Unknown'}, apt {item.residents?.apartment_no ?? '?'}
      </p>

      {item.description && (
        <p className="text-sm text-gray-700 mt-4">{item.description}</p>
      )}

      {isOwnItem ? (
        <p className="text-sm text-gray-400 mt-6">This is your own listing.</p>
      ) : (
        <form onSubmit={handleRequestToBorrow} className="mt-6 space-y-3">
          <textarea
            placeholder="Say hi and let them know when you'd like to borrow it"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={3}
            className="w-full rounded-2xl border border-gray-200 px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-full bg-black text-white py-3 text-sm font-medium disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Request to borrow'}
          </button>
        </form>
      )}
    </div>
  )
}