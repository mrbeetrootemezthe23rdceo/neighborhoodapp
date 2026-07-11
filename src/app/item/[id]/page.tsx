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
  listing_type: 'offer' | 'request'
  residents: { name: string; apartment_no: string } | null
}

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [item, setItem] = useState<Item | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [deleting, setDeleting] = useState(false)
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
        .select('id, title, description, category, condition, photo_url, owner_id, listing_type, residents(name, apartment_no)')
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

  async function handleDelete() {
    if (!item) return
    const confirmed = window.confirm('Delete this listing? This cannot be undone.')
    if (!confirmed) return

    setDeleting(true)
    const { error } = await supabase.from('items').delete().eq('id', item.id)
    setDeleting(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>
  }

  if (!item) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Item not found.</div>
  }

  const isOwnItem = item.owner_id === currentUserId

  return (
    <div className="min-h-screen px-8 py-10 max-w-lg mx-auto" style={{ background: '#FFE9D6' }}>
      <button onClick={() => router.push('/')} className="text-base mb-5 cursor-pointer" style={{ color: '#9A3412' }}>
        ← Back
      </button>

      <div className="rounded-2xl overflow-hidden h-72 flex items-center justify-center text-base mb-5" style={{ background: '#FFF3E8', color: '#C2410C' }}>
        {item.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.photo_url} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          'No photo'
        )}
      </div>

      <h1 className="text-2xl font-bold" style={{ color: '#7C2D12' }}>{item.title}</h1>
      <p className="text-base mt-1.5" style={{ color: '#9A3412' }}>
        {item.category}{item.condition ? ` · ${item.condition}` : ''}
      </p>
      <p className="text-base mt-1.5" style={{ color: '#9A3412' }}>
        {item.listing_type === 'request' ? 'Requested by' : 'Owned by'} {item.residents?.name ?? 'Unknown'}, apt {item.residents?.apartment_no ?? '?'}
      </p>

      {item.description && (
        <p className="text-base mt-5" style={{ color: '#431407' }}>{item.description}</p>
      )}

      {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

      {isOwnItem ? (
        <div className="mt-7 flex gap-3">
          <a
            href={`/item/${item.id}/edit`}
            className="flex-1 rounded-full py-3.5 text-base font-medium text-center cursor-pointer"
            style={{ backgroundColor: 'white', color: '#9A3412', border: '1px solid #FED7AA' }}
          >
            Edit
          </a>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 rounded-full py-3.5 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{ backgroundColor: 'white', color: '#DC2626', border: '1px solid #FCA5A5' }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleRequestToBorrow} className="mt-7 space-y-4">
          <textarea
            placeholder={item.listing_type === 'request' ? "Let them know you have one to lend" : "Say hi and let them know when you'd like to borrow it"}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={3}
            className="w-full rounded-2xl bg-white px-6 py-3.5 text-base focus:outline-none focus:ring-2"
            style={{ border: '1px solid #FED7AA' }}
          />
          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-full text-white py-3.5 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{ backgroundColor: '#EA580C' }}
          >
            {sending ? 'Sending...' : item.listing_type === 'request' ? 'I have one to offer' : 'Request to borrow'}
          </button>
        </form>
      )}
    </div>
  )
}
