'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
    <div className="flex items-center gap-4 mb-10 pb-5" style={{ borderBottom: '1px solid #FDBA74' }}>
      <Link href="/" className="whitespace-nowrap flex items-center gap-1" style={{ color: '#111111' }}>
        <span style={{ fontFamily: 'var(--font-fredoka)', fontWeight: 700, fontSize: '35px' }}>ToolShare</span>
        <span style={{ display: 'inline-block', transform: 'rotate(25deg)', fontSize: '23px' }}>🔧</span>
      </Link>

      {onSearchChange !== undefined && (
        <input
          type="text"
          aria-label="Search listings"
          placeholder="Search for a drill, ladder, tent..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 rounded-full bg-white px-6 py-3.5 text-base focus:outline-none focus:ring-2"
          style={{ color: '#B45309' }}
        />
      )}

      <Link
        href="/list-item"
        className="text-base text-white rounded-full px-6 py-3.5 whitespace-nowrap cursor-pointer"
        style={{ backgroundColor: '#EA580C' }}
      >
        + List item
      </Link>
      <Link href="/my-listings" className="text-base whitespace-nowrap cursor-pointer nav-link" style={{ color: '#111111' }}>
        My listings
      </Link>
      <Link href="/messages" className="text-base whitespace-nowrap cursor-pointer nav-link" style={{ color: '#111111' }}>
        Messages
      </Link>
      <button onClick={handleLogout} className="text-base whitespace-nowrap cursor-pointer nav-link" style={{ color: '#111111' }}>
        Log out
      </button>
    </div>
  )
}
