import { createClient } from '@supabase/supabase-js'

// These come from your .env.local file (see .env.local.example).
// NEXT_PUBLIC_ prefix is required so Next.js exposes them to the browser —
// this is safe for the anon key specifically, since RLS policies (see
// schema.sql) control what it's actually allowed to read or write.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
