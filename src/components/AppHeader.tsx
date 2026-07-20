'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MagnifyingGlassIcon, PlusIcon } from '@phosphor-icons/react/dist/ssr'
import { supabase } from '@/lib/supabaseClient'
import { Input } from '@/components/ui/input'

const NAV_LINKS = [
  { href: '/', label: 'Browse' },
  { href: '/my-listings', label: 'My listings' },
  { href: '/messages', label: 'Messages' },
]

export default function AppHeader({
  search,
  onSearchChange,
}: {
  search?: string
  onSearchChange?: (val: string) => void
}) {
  const pathname = usePathname()
  const [initial, setInitial] = useState('?')

  useEffect(() => {
    async function loadResident() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return
      const { data: resident } = await supabase
        .from('residents')
        .select('name')
        .eq('id', userData.user.id)
        .single()
      const name = resident?.name?.trim()
      setInitial(name ? name[0].toUpperCase() : userData.user.email?.[0]?.toUpperCase() ?? '?')
    }
    loadResident()
  }, [])

  return (
    <div className="sticky top-0 z-20 w-full border-b border-border-soft bg-canvas px-8 py-3.5">
      <div className="mx-auto flex max-w-7xl items-center gap-7">
        <Link href="/" className="shrink-0 text-xl font-semibold tracking-tight text-ink">
          ToolShare
        </Link>

        <div className="flex shrink-0 gap-1 rounded-xl bg-canvas-soft p-1">
          {NAV_LINKS.map((link) => {
            const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`cursor-pointer rounded-lg px-4 py-2 text-sm whitespace-nowrap ${
                  active ? 'bg-ink font-semibold text-canvas-soft' : 'text-ink hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {onSearchChange !== undefined && (
          <div className="relative flex-1">
            <MagnifyingGlassIcon
              size={16}
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink/50"
            />
            <Input
              type="text"
              aria-label="Search listings"
              placeholder="Search for a drill, ladder, tent..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-10 rounded-md border-ink pl-9"
            />
          </div>
        )}

        <div className="flex shrink-0 items-center gap-4">
          <Link
            href="/list-item"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold whitespace-nowrap text-primary-foreground"
          >
            <PlusIcon size={16} weight="bold" />
            List item
          </Link>
          <Link
            href="/profile"
            title="Profile"
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-ink text-sm font-semibold text-canvas-soft"
          >
            {initial}
          </Link>
        </div>
      </div>
    </div>
  )
}
