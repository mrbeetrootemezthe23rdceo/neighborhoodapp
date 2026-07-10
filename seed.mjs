import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

const RESIDENTS = [
  { email: 'jane@example.com', name: 'Jane Cooper', apartment_no: '3B', phone: '555-0101' },
  { email: 'mark@example.com', name: 'Mark Alvarez', apartment_no: '1A', phone: '555-0102' },
  { email: 'priya@example.com', name: 'Priya Nair', apartment_no: '5C', phone: '555-0103' },
  { email: 'tom@example.com', name: 'Tom Berg', apartment_no: '2D', phone: '555-0104' },
]

const ITEMS_BY_EMAIL = {
  'jane@example.com': [
    { title: 'Bosch cordless drill', category: 'Power Tools', condition: 'Like new', description: '18V, comes with two batteries and a charger.' },
    { title: 'Stand mixer', category: 'Kitchen', condition: 'Good', description: 'Great for bread dough, rarely used.' },
  ],
  'mark@example.com': [
    { title: 'Extension ladder, 12ft', category: 'Garden', condition: 'Good', description: 'Aluminum, lightweight, good for gutter cleaning.' },
    { title: 'Pressure washer', category: 'Household', condition: 'Fair', description: 'Works well, a bit loud.' },
  ],
  'priya@example.com': [
    { title: '4-person tent', category: 'Camping', condition: 'Like new', description: 'Used once, easy setup, includes rainfly.' },
    { title: 'Camping stove', category: 'Camping', condition: 'Good', description: 'Dual burner, propane, works great.' },
  ],
  'tom@example.com': [
    { title: 'Tennis racket set (2)', category: 'Sports & Outdoor', condition: 'Good', description: 'Two rackets, a few balls included.' },
    { title: 'Bluetooth speaker', category: 'Electronics', condition: 'Like new', description: 'Great sound, barely used.' },
  ],
}

async function seed() {
  for (const resident of RESIDENTS) {
    console.log(`Creating ${resident.email}...`)

    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email: resident.email,
      password: 'password123',
      email_confirm: true,
    })

    if (createError) {
      console.error(`  Failed to create user: ${createError.message}`)
      continue
    }

    const userId = userData.user.id

    // The signup trigger already created an empty residents row — fill it in.
    const { error: updateError } = await supabase
      .from('residents')
      .update({
        name: resident.name,
        apartment_no: resident.apartment_no,
        phone: resident.phone,
      })
      .eq('id', userId)

    if (updateError) {
      console.error(`  Failed to update resident profile: ${updateError.message}`)
      continue
    }

    const items = ITEMS_BY_EMAIL[resident.email] || []
    for (const item of items) {
      const { error: itemError } = await supabase.from('items').insert({
        owner_id: userId,
        ...item,
      })
      if (itemError) {
        console.error(`  Failed to insert item "${item.title}": ${itemError.message}`)
      } else {
        console.log(`  Added item: ${item.title}`)
      }
    }
  }

  console.log('Done seeding.')
}

seed()
