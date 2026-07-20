'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function CompleteProfilePage() {
  const [name, setName] = useState('')
  const [apartmentNo, setApartmentNo] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      setLoading(false)
      setError('You need to be logged in to do this.')
      return
    }

    const { error } = await supabase
      .from('residents')
      .update({ name, apartment_no: apartmentNo, phone })
      .eq('id', userData.user.id)

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="px-8 py-6">
        <Link href="/" className="text-xl font-semibold tracking-tight text-ink">
          ToolShare
        </Link>
      </div>

      <div className="mx-auto my-auto w-full max-w-md rounded-md bg-canvas-soft p-8">
        <h1 className="text-3xl font-medium text-ink">One more step</h1>
        <p className="mt-1.5 text-base text-body">Tell your neighbors who you are</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Your name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Jane Cooper"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11 rounded-sm border-ink px-4 text-base"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="apartmentNo">Apartment number</Label>
            <Input
              id="apartmentNo"
              type="text"
              placeholder="e.g. 3B"
              value={apartmentNo}
              onChange={(e) => setApartmentNo(e.target.value)}
              required
              className="h-11 rounded-sm border-ink px-4 text-base"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="555-0100"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-11 rounded-sm border-ink px-4 text-base"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="mt-2 h-12 w-full cursor-pointer justify-center text-base"
          >
            {loading ? 'Saving...' : 'Finish setup'}
          </Button>
        </form>
      </div>
    </div>
  )
}
