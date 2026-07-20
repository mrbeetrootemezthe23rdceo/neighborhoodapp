'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import AppHeader from '@/components/AppHeader'
import ConversationSidebar from '@/components/ConversationSidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PaperPlaneTiltIcon } from '@phosphor-icons/react/dist/ssr'

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
  requester_id: string
  owner_id: string
  items: { title: string } | null
  requester: { name: string } | null
  owner: { name: string } | null
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
        .select(
          `
          id, item_id, requester_id, owner_id,
          items(title),
          requester:residents!conversations_requester_id_fkey(name),
          owner:residents!conversations_owner_id_fkey(name)
        `
        )
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

  const otherPerson =
    conversation && currentUserId
      ? conversation.requester_id === currentUserId
        ? conversation.owner
        : conversation.requester
      : null

  return (
    <div className="flex h-screen flex-col">
      <AppHeader />

      <div className="mx-auto flex h-[calc(100vh-70px)] w-full max-w-7xl">
        <ConversationSidebar activeId={id} />

        <div className="flex min-w-0 flex-1 flex-col">
          {loading ? (
            <div className="flex flex-1 items-center justify-center text-body-mid">Loading...</div>
          ) : !conversation ? (
            <div className="flex flex-1 items-center justify-center text-body-mid">Conversation not found.</div>
          ) : (
            <>
              <div className="border-b border-border-soft px-6 pt-8 pb-4">
                <p className="text-lg font-semibold text-ink">{otherPerson?.name ?? 'Neighbor'}</p>
                <p className="mt-0.5 text-sm text-body-mid">About {conversation.items?.title ?? 'this item'}</p>
              </div>

              <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-6">
                {messages.map((msg) => {
                  const isMine = msg.sender_id === currentUserId
                  return (
                    <div
                      key={msg.id}
                      className={`max-w-[60%] rounded-md px-4 py-2.5 text-base ${
                        isMine ? 'self-end bg-ink text-canvas-soft' : 'self-start border border-border-soft bg-canvas text-ink'
                      }`}
                    >
                      {msg.body}
                    </div>
                  )
                })}
              </div>

              <form onSubmit={handleSend} className="flex gap-3 border-t border-border-soft px-6 py-4">
                <Input
                  type="text"
                  aria-label="Type a message"
                  placeholder="Write a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="h-11 flex-1 rounded-sm border-ink px-4 text-base"
                />
                <Button type="submit" disabled={sending} className="h-11 cursor-pointer gap-1.5 px-5 text-base">
                  <PaperPlaneTiltIcon size={16} weight="bold" />
                  Send
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
