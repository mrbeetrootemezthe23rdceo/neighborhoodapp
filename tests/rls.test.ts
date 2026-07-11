import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const secretKey = process.env.SUPABASE_SECRET_KEY!

// Admin client — bypasses RLS entirely, used only for test setup/cleanup,
// never for the actual security checks below.
const adminClient = createClient(supabaseUrl, secretKey)

// Fresh client per resident, matching exactly how the real app authenticates.
function clientAs() {
  return createClient(supabaseUrl, anonKey)
}

let janeId: string
let markId: string
let markItemId: string
let conversationId: string

beforeAll(async () => {
  const { data: jane } = await adminClient.from('residents').select('id').eq('name', 'Jane Cooper').single()
  const { data: mark } = await adminClient.from('residents').select('id').eq('name', 'Mark Alvarez').single()
  janeId = jane!.id
  markId = mark!.id

  const { data: markItem } = await adminClient
    .from('items')
    .select('id')
    .eq('owner_id', markId)
    .limit(1)
    .single()
  markItemId = markItem!.id

  // Set up a real conversation between Jane and Mark, so we have something
  // to test "can a third party read this?" against.
  const { data: convo } = await adminClient
    .from('conversations')
    .insert({ item_id: markItemId, requester_id: janeId, owner_id: markId })
    .select('id')
    .single()
  conversationId = convo!.id

  await adminClient.from('messages').insert({
    conversation_id: conversationId,
    sender_id: janeId,
    body: 'RLS test message',
  })
})

afterAll(async () => {
  // Clean up everything we created, so re-running tests doesn't pile up junk data.
  await adminClient.from('messages').delete().eq('conversation_id', conversationId)
  await adminClient.from('conversations').delete().eq('id', conversationId)
})

describe('Row-level security', () => {
  it('does NOT allow one resident to update another resident\'s profile', async () => {
    const asJane = clientAs()
    await asJane.auth.signInWithPassword({ email: 'jane@example.com', password: 'password123' })

    const { data } = await asJane
      .from('residents')
      .update({ name: 'Hacked Name' })
      .eq('id', markId)
      .select()

    // RLS silently returns zero rows updated, rather than a loud error —
    // this is the expected Supabase/Postgres behavior for a blocked update.
    expect(data).toHaveLength(0)
  })

  it('does NOT allow one resident to delete another resident\'s item', async () => {
    const asJane = clientAs()
    await asJane.auth.signInWithPassword({ email: 'jane@example.com', password: 'password123' })

    const { data } = await asJane
      .from('items')
      .delete()
      .eq('id', markItemId)
      .select()

    expect(data).toHaveLength(0)
  })

  it('does NOT allow a non-participant to read a conversation\'s messages', async () => {
    const asTom = clientAs()
    await asTom.auth.signInWithPassword({ email: 'tom@example.com', password: 'password123' })

    const { data } = await asTom
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)

    expect(data).toHaveLength(0)
  })

  it('DOES allow an actual participant to read the conversation\'s messages', async () => {
    const asMark = clientAs()
    await asMark.auth.signInWithPassword({ email: 'mark@example.com', password: 'password123' })

    const { data } = await asMark
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)

    expect(data!.length).toBeGreaterThan(0)
  })
})
