'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AppHeader({
  search,
  onSearchChange,
}: {
  search?: string
  onSearchChange?: (val: string) => void
}) {
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex items-center gap-4 mb-10">
      <a href="/" className="text-2xl font-bold whitespace-nowrap">ToolShare</a>

      {onSearchChange !== undefined && (
        <input
          type="text"
          placeholder="Search for a drill, ladder, tent..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 rounded-full bg-gray-100 px-6 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      )}

      <a href="/list-item" className="text-base bg-black text-white rounded-full px-6 py-3.5 whitespace-nowrap">
        + List item
      </a>
      <a href="/messages" className="text-base text-gray-500 whitespace-nowrap">
        Messages
      </a>
      <button onClick={handleLogout} className="text-base text-gray-500 whitespace-nowrap">
        Log out
      </button>
    </div>
  )
}
