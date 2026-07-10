'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

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
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">One more step</h1>
        <p className="text-gray-500 mb-6 text-sm">Tell your neighbors who you are</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-full border border-gray-200 px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            placeholder="Apartment number (e.g. 3B)"
            value={apartmentNo}
            onChange={(e) => setApartmentNo(e.target.value)}
            required
            className="w-full rounded-full border border-gray-200 px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="tel"
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-full border border-gray-200 px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-black text-white py-3 text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Finish setup'}
          </button>
        </form>
      </div>
    </div>
  )
}
