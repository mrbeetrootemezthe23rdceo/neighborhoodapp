'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { formatRelativeTime } from '@/lib/formatRelativeTime'

type ConversationRow = {
  id: string
  requester_id: string
  owner_id: string
  items: { title: string } | null
  requester: { name: string } | null
  owner: { name: string } | null
}

export type ConversationSummary = {
  id: string
  itemTitle: string
  otherName: string
  preview: string
  time: string
  sortKey: number
}

export default function ConversationSidebar({ activeId }: { activeId?: string }) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        setLoading(false)
        return
      }
      const currentUserId = userData.user.id

      const { data: convoData } = await supabase
        .from('conversations')
        .select(
          `
          id, requester_id, owner_id,
          items(title),
          requester:residents!conversations_requester_id_fkey(name),
          owner:residents!conversations_owner_id_fkey(name)
        `
        )
        .order('created_at', { ascending: false })

      const rows = (convoData as unknown as ConversationRow[]) ?? []

      let lastMessageByConversation = new Map<string, { body: string; created_at: string }>()
      if (rows.length > 0) {
        const { data: messageData } = await supabase
          .from('messages')
          .select('conversation_id, body, created_at')
          .in(
            'conversation_id',
            rows.map((r) => r.id)
          )
          .order('created_at', { ascending: false })

        lastMessageByConversation = new Map()
        for (const msg of messageData ?? []) {
          if (!lastMessageByConversation.has(msg.conversation_id)) {
            lastMessageByConversation.set(msg.conversation_id, { body: msg.body, created_at: msg.created_at })
          }
        }
      }

      const summaries: ConversationSummary[] = rows.map((c) => {
        const otherPerson = c.requester_id === currentUserId ? c.owner : c.requester
        const last = lastMessageByConversation.get(c.id)
        return {
          id: c.id,
          itemTitle: c.items?.title ?? 'Item',
          otherName: otherPerson?.name ?? 'Neighbor',
          preview: last?.body ?? 'No messages yet',
          time: last ? formatRelativeTime(last.created_at) : '',
          sortKey: last ? new Date(last.created_at).getTime() : 0,
        }
      })

      summaries.sort((a, b) => b.sortKey - a.sortKey)

      setConversations(summaries)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="flex h-full w-[300px] shrink-0 flex-col overflow-y-auto border-r border-border-soft pt-6">
      <div className="px-4 pb-4 text-2xl font-semibold text-ink">Messages</div>

      {loading ? (
        <p className="px-4 text-sm text-body-mid">Loading...</p>
      ) : conversations.length === 0 ? (
        <p className="px-4 text-sm text-body-mid">No conversations yet.</p>
      ) : (
        <div className="flex flex-col gap-1 px-2">
          {conversations.map((c) => (
            <Link
              key={c.id}
              href={`/messages/${c.id}`}
              className={`flex cursor-pointer gap-3 rounded-md px-3 py-3.5 ${
                c.id === activeId ? 'bg-canvas-soft' : 'hover:bg-canvas-soft/60'
              }`}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-ink text-sm font-semibold text-ink">
                {c.otherName[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-base font-semibold text-ink">{c.otherName}</span>
                  {c.time && <span className="shrink-0 text-xs text-body-mid">{c.time}</span>}
                </div>
                <p className="mt-0.5 truncate text-sm text-body-mid">{c.preview}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
