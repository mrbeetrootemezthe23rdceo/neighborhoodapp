'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

const CATEGORIES = [
  'Power Tools', 'Hand Tools', 'Garden', 'Kitchen',
  'Sports & Outdoor', 'Camping', 'Household', 'Electronics',
]

const CONDITIONS = ['Like new', 'Good', 'Fair']

export default function EditItemPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [listingType, setListingType] = useState<'offer' | 'request'>('offer')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [condition, setCondition] = useState(CONDITIONS[0])
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [ownerId, setOwnerId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('items')
        .select('title, description, category, condition, photo_url, owner_id, listing_type')
        .eq('id', id)
        .single()

      if (error || !data) {
        setError('Could not load this listing.')
        setLoading(false)
        return
      }

      if (data.owner_id !== userData.user.id) {
        router.push('/')
        return
      }

      setTitle(data.title)
      setDescription(data.description ?? '')
      setCategory(data.category)
      setCondition(data.condition ?? CONDITIONS[0])
      setCurrentPhotoUrl(data.photo_url)
      setOwnerId(data.owner_id)
      setListingType(data.listing_type)
      setLoading(false)
    }
    load()
  }, [id, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!ownerId) return

    setSaving(true)
    setError(null)

    let photoUrl = currentPhotoUrl

    if (listingType === 'offer' && photoFile) {
      const filePath = `${ownerId}/${Date.now()}-${photoFile.name}`

      const { error: uploadError } = await supabase.storage
        .from('item-photos')
        .upload(filePath, photoFile)

      if (uploadError) {
        setSaving(false)
        setError(`Photo upload failed: ${uploadError.message}`)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('item-photos')
        .getPublicUrl(filePath)

      photoUrl = publicUrlData.publicUrl
    }

    const { error: updateError } = await supabase
      .from('items')
      .update({
        title,
        description,
        category,
        condition: listingType === 'offer' ? condition : null,
        photo_url: listingType === 'offer' ? photoUrl : null,
      })
      .eq('id', id)

    setSaving(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    router.push(`/item/${id}`)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>
  }

  return (
    <div className="min-h-screen px-8 py-10 max-w-lg mx-auto" style={{ background: '#FFE9D6' }}>
      <h1 className="text-3xl font-bold mb-2" style={{ color: '#7C2D12' }}>Edit listing</h1>
      <p className="mb-8 text-base" style={{ color: '#9A3412' }}>
        {listingType === 'offer' ? 'Update the details of what you\'re lending' : 'Update what you\'re looking for'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full rounded-full bg-white px-6 py-3.5 text-base focus:outline-none focus:ring-2"
          style={{ border: '1px solid #FED7AA' }}
        />

        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-2xl bg-white px-6 py-3.5 text-base focus:outline-none focus:ring-2"
          style={{ border: '1px solid #FED7AA' }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-full bg-white px-6 py-3.5 text-base focus:outline-none focus:ring-2"
          style={{ border: '1px solid #FED7AA' }}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {listingType === 'offer' && (
          <>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full rounded-full bg-white px-6 py-3.5 text-base focus:outline-none focus:ring-2"
              style={{ border: '1px solid #FED7AA' }}
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {currentPhotoUrl && !photoFile && (
              <div className="rounded-xl overflow-hidden h-32 w-32">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={currentPhotoUrl} alt={title} className="w-full h-full object-cover" />
              </div>
            )}

            <div>
              <label className="block text-base mb-2" style={{ color: '#9A3412' }}>
                {currentPhotoUrl ? 'Replace photo (optional)' : 'Photo (optional)'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                className="text-base file:cursor-pointer file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-5 file:py-2.5 file:text-sm file:font-medium"
                style={{ color: '#9A3412' }}
              />
            </div>
          </>
        )}

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push(`/item/${id}`)}
            className="flex-1 rounded-full py-3.5 text-base font-medium cursor-pointer"
            style={{ backgroundColor: 'white', color: '#9A3412', border: '1px solid #FED7AA' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-full text-white py-3.5 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{ backgroundColor: '#EA580C' }}
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
