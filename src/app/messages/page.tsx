'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import AppHeader from '@/components/AppHeader'
import ConversationSidebar from '@/components/ConversationSidebar'
import { ChatCircleIcon } from '@phosphor-icons/react/dist/ssr'

export default function MessagesListPage() {
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/login')
        return
      }
      setCheckingAuth(false)
    })
  }, [router])

  if (checkingAuth) {
    return <div className="flex min-h-screen items-center justify-center text-body-mid">Loading...</div>
  }

  return (
    <div className="flex h-screen flex-col">
      <AppHeader />

      <div className="mx-auto flex h-[calc(100vh-70px)] w-full max-w-7xl">
        <ConversationSidebar />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-body-mid">
          <ChatCircleIcon size={40} className="text-mute" />
          <p className="text-base">Select a conversation to view messages</p>
        </div>
      </div>
    </div>
  )
}
