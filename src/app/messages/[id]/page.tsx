'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type Message = {
  id: string
  body: string
  created_at: string
  sender_id: string
  residents: { name: string } | null
}

type ConversationInfo = {
  id: string
  item_id: string
  items: { title: string } | null
}

export default function ThreadPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [conversation, setConversation] = useState<ConversationInfo | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push('/login')
        return
      }
      setCurrentUserId(userData.user.id)

      const { data: convoData } = await supabase
        .from('conversations')
        .select('id, item_id, items(title)')
        .eq('id', id)
        .single()

      setConversation(convoData as unknown as ConversationInfo)

      const { data: messageData } = await supabase
        .from('messages')
        .select('id, body, created_at, sender_id, residents(name)')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true })

      setMessages((messageData as unknown as Message[]) ?? [])
      setLoading(false)
    }
    load()
  }, [id, router])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUserId || !newMessage.trim()) return

    setSending(true)

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: id,
        sender_id: currentUserId,
        body: newMessage,
      })
      .select('id, body, created_at, sender_id, residents(name)')
      .single()

    setSending(false)

    if (!error && data) {
      setMessages((prev) => [...prev, data as unknown as Message])
      setNewMessage('')
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>
  }

  return (
    <div className="min-h-screen px-8 py-10 max-w-lg mx-auto flex flex-col" style={{ background: '#FFE9D6' }}>
      <button onClick={() => router.push('/messages')} className="text-base mb-5 cursor-pointer" style={{ color: '#9A3412' }}>
        ← All messages
      </button>

      <h1 className="text-xl font-bold mb-5" style={{ color: '#7C2D12' }}>
        {conversation?.items?.title ?? 'Conversation'}
      </h1>

      <div className="flex-1 space-y-4 mb-5">
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId
          return (
            <div
              key={msg.id}
              className="max-w-[75%] rounded-2xl px-5 py-3 text-base"
              style={isMine
                ? { backgroundColor: '#EA580C', color: 'white', marginLeft: 'auto' }
                : { backgroundColor: 'white', color: '#431407' }}
            >
              {!isMine && (
                <p className="text-sm mb-1" style={{ color: '#9A3412' }}>{msg.residents?.name ?? 'Neighbor'}</p>
              )}
              <p>{msg.body}</p>
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSend} className="flex gap-3">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 rounded-full bg-white px-6 py-3 text-base focus:outline-none focus:ring-2"
          style={{ border: '1px solid #FED7AA' }}
        />
        <button
          type="submit"
          disabled={sending}
          className="rounded-full text-white px-6 py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          style={{ backgroundColor: '#EA580C' }}
        >
          Send
        </button>
      </form>
    </div>
  )
}
