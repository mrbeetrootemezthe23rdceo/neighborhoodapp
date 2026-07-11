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
  const [listingType, setListingType] = useState<'offer' | 'request'>('offer')
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

    if (listingType === 'offer' && photoFile) {
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
      condition: listingType === 'offer' ? condition : null,
      photo_url: photoUrl,
      listing_type: listingType,
    })

    setLoading(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    router.push('/')
  }

  return (
    <div className="min-h-screen px-8 py-10 max-w-lg mx-auto" style={{ background: '#FFE9D6' }}>
      <button onClick={() => router.push('/')} className="text-base mb-5 cursor-pointer" style={{ color: '#9A3412' }}>
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-2" style={{ color: '#7C2D12' }}>List an item</h1>
      <p className="mb-8 text-base" style={{ color: '#9A3412' }}>Share something, or ask for something you need</p>

      <div className="flex gap-2 mb-7 bg-white rounded-full p-1">
        <button
          type="button"
          onClick={() => setListingType('offer')}
          className="flex-1 rounded-full py-2.5 text-sm font-medium cursor-pointer"
          style={listingType === 'offer' ? { backgroundColor: '#FFF3E8', color: '#9A3412' } : { color: '#B45309' }}
        >
          I have this to lend
        </button>
        <button
          type="button"
          onClick={() => setListingType('request')}
          className="flex-1 rounded-full py-2.5 text-sm font-medium cursor-pointer"
          style={listingType === 'request' ? { backgroundColor: '#FFF3E8', color: '#9A3412' } : { color: '#B45309' }}
        >
          I&apos;m looking for this
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1.5" style={{ color: '#9A3412' }}>
            {listingType === 'offer' ? 'Item name' : 'What are you looking for?'}
          </label>
          <input
            id="title"
            type="text"
            placeholder={listingType === 'offer' ? 'e.g. Cordless drill' : 'e.g. Bluetooth speaker'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-full bg-white px-6 py-3.5 text-base focus:outline-none focus:ring-2"
            style={{ border: '1px solid #FED7AA' }}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1.5" style={{ color: '#9A3412' }}>Description (optional)</label>
          <textarea
            id="description"
            placeholder="Any details worth mentioning"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-2xl bg-white px-6 py-3.5 text-base focus:outline-none focus:ring-2"
            style={{ border: '1px solid #FED7AA' }}
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1.5" style={{ color: '#9A3412' }}>Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-full bg-white px-6 py-3.5 text-base focus:outline-none focus:ring-2"
            style={{ border: '1px solid #FED7AA' }}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {listingType === 'offer' && (
          <>
            <div>
              <label htmlFor="condition" className="block text-sm font-medium mb-1.5" style={{ color: '#9A3412' }}>Condition</label>
              <select
                id="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full rounded-full bg-white px-6 py-3.5 text-base focus:outline-none focus:ring-2"
                style={{ border: '1px solid #FED7AA' }}
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="photo" className="block text-base mb-2" style={{ color: '#9A3412' }}>Photo (optional)</label>
              <input
                id="photo"
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

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full text-white py-3.5 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          style={{ backgroundColor: '#EA580C' }}
        >
          {loading ? 'Posting...' : listingType === 'offer' ? 'List item' : 'Post request'}
        </button>
      </form>
    </div>
  )
}
