'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

const CATEGORIES = [
  'Power Tools', 'Hand Tools', 'Garden', 'Kitchen',
  'Sports & Outdoor', 'Camping', 'Household', 'Electronics',
]

const CONDITIONS = ['Like new', 'Good', 'Fair']

export default function ListItemPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [condition, setCondition] = useState(CONDITIONS[0])
  const [photoFile, setPhotoFile] = useState<File | null>(null)
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

    const userId = userData.user.id
    let photoUrl: string | null = null

    if (photoFile) {
      const filePath = `${userId}/${Date.now()}-${photoFile.name}`

      const { error: uploadError } = await supabase.storage
        .from('item-photos')
        .upload(filePath, photoFile)

      if (uploadError) {
        setLoading(false)
        setError(`Photo upload failed: ${uploadError.message}`)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('item-photos')
        .getPublicUrl(filePath)

      photoUrl = publicUrlData.publicUrl
    }

    const { error: insertError } = await supabase.from('items').insert({
      owner_id: userId,
      title,
      description,
      category,
      condition,
      photo_url: photoUrl,
    })

    setLoading(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    router.push('/')
  }

  return (
    <div className="min-h-screen bg-white px-8 py-10 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-2">List an item</h1>
      <p className="text-gray-500 mb-8 text-base">Share something with your neighbors</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="text"
          placeholder="Item name (e.g. Cordless drill)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full rounded-full border border-gray-200 px-6 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-2xl border border-gray-200 px-6 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-full border border-gray-200 px-6 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className="w-full rounded-full border border-gray-200 px-6 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <div>
          <label className="block text-base text-gray-500 mb-2">Photo (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            className="text-base"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-black text-white py-3.5 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? 'Listing item...' : 'List item'}
        </button>
      </form>
    </div>
  )
}
