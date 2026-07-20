'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import AppHeader from '@/components/AppHeader'
import CategoryIcon from '@/components/CategoryIcon'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr'

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
    return <div className="flex min-h-screen items-center justify-center text-body-mid">Loading...</div>
  }

  if (!item) {
    return <div className="flex min-h-screen items-center justify-center text-body-mid">Item not found.</div>
  }

  const isOwnItem = item.owner_id === currentUserId

  return (
    <div className="min-h-screen">
      <AppHeader />

      <div className="mx-auto max-w-lg px-8 py-10">
        <button
          onClick={() => router.push('/')}
          className="mb-5 inline-flex cursor-pointer items-center gap-1.5 text-sm text-body"
        >
          <ArrowLeftIcon size={16} />
          Back
        </button>

        <div className="mb-5 flex h-72 items-center justify-center overflow-hidden rounded-md bg-canvas-soft">
          {item.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.photo_url} alt={item.title} className="h-full w-full object-cover" />
          ) : (
            <CategoryIcon category={item.category} size={88} className="bg-transparent" />
          )}
        </div>

        <h1 className="text-2xl font-semibold text-ink">{item.title}</h1>
        <p className="mt-1.5 text-base text-body">
          {item.category}
          {item.condition ? ` · ${item.condition}` : ''}
        </p>
        <p className="mt-1.5 text-base text-body">
          {item.listing_type === 'request' ? 'Requested by' : 'Owned by'} {item.residents?.name ?? 'Unknown'}, apt{' '}
          {item.residents?.apartment_no ?? '?'}
        </p>

        {item.description && <p className="mt-5 text-base text-ink-soft">{item.description}</p>}

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        {isOwnItem ? (
          <div className="mt-7 flex gap-3">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href={`/item/${item.id}/edit`} />}
              className="h-12 flex-1 cursor-pointer justify-center text-base"
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="h-12 flex-1 cursor-pointer justify-center text-base"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleRequestToBorrow} className="mt-7 flex flex-col gap-4">
            <Textarea
              aria-label="Message"
              placeholder={
                item.listing_type === 'request'
                  ? 'Let them know you have one to lend'
                  : "Say hi and let them know when you'd like to borrow it"
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={3}
              className="rounded-sm border-ink px-4 py-3 text-base"
            />
            <Button type="submit" disabled={sending} className="h-12 w-full cursor-pointer justify-center text-base">
              {sending ? 'Sending...' : item.listing_type === 'request' ? 'I have one to offer' : 'Request to borrow'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
