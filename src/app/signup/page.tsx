'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signUp({ email, password })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/complete-profile')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="px-8 py-6">
        <Link href="/" className="text-xl font-semibold tracking-tight text-ink">
          ToolShare
        </Link>
      </div>

      <div className="mx-auto my-auto w-full max-w-md rounded-md bg-canvas-soft p-8">
        <h1 className="text-3xl font-medium text-ink">Create your account</h1>
        <p className="mt-1.5 text-base text-body">Join neighbors nearby sharing tools and gear</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 rounded-sm border-ink px-4 text-base"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-11 rounded-sm border-ink px-4 text-base"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="mt-2 h-12 w-full cursor-pointer justify-center text-base"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-body-mid">
          Already have an account?{' '}
          <Link href="/login" className="cursor-pointer font-semibold text-primary">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
