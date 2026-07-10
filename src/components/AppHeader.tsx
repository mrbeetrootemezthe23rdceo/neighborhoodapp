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
      <a href="/" className="text-2xl font-bold whitespace-nowrap" style={{ color: '#7C2D12' }}>ToolShare</a>

      {onSearchChange !== undefined && (
        <input
          type="text"
          placeholder="Search for a drill, ladder, tent..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 rounded-full bg-white px-6 py-3.5 text-base focus:outline-none focus:ring-2"
          style={{ color: '#B45309' }}
        />
      )}

      <a
        href="/list-item"
        className="text-base text-white rounded-full px-6 py-3.5 whitespace-nowrap cursor-pointer"
        style={{ backgroundColor: '#EA580C' }}
      >
        + List item
      </a>
      <a href="/messages" className="text-base whitespace-nowrap" style={{ color: '#9A3412' }}>
        Messages
      </a>
      <button onClick={handleLogout} className="text-base whitespace-nowrap cursor-pointer" style={{ color: '#9A3412' }}>
        Log out
      </button>
    </div>
  )
}
