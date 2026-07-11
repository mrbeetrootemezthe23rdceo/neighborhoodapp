'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setLoading(false)
      setError(error.message)
      return
    }

    const { data: resident } = await supabase
      .from('residents')
      .select('name')
      .eq('id', data.user.id)
      .single()

    setLoading(false)

    if (!resident?.name) {
      router.push('/complete-profile')
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FFE9D6' }}>
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#7C2D12' }}>Welcome back</h1>
        <p className="mb-8 text-base" style={{ color: '#9A3412' }}>Log in to browse and lend tools</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: '#9A3412' }}>Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-full bg-white px-6 py-3.5 text-base focus:outline-none focus:ring-2"
              style={{ border: '1px solid #FED7AA' }}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: '#9A3412' }}>Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-full bg-white px-6 py-3.5 text-base focus:outline-none focus:ring-2"
              style={{ border: '1px solid #FED7AA' }}
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full text-white py-3.5 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{ backgroundColor: '#EA580C' }}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="text-base mt-6" style={{ color: '#9A3412' }}>
          No account yet?{' '}
          <a href="/signup" className="font-medium cursor-pointer" style={{ color: '#C2410C' }}>Sign up</a>
        </p>
      </div>
    </div>
  )
}
