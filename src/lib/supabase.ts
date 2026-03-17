/**
 * Supabase client
 *
 * Usage:
 * 1. Install the client: `pnpm add @supabase/supabase-js` (already added to package.json)
 * 2. Add env vars in `.env` (copy from .env.example)
 * 3. Import from `src/lib/supabase` and use `supabase`:
 *
 *    import { supabase } from '@/lib/supabase'
 *    const { data, error } = await supabase.from('tournaments').select('*')
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Warn in dev if env vars are missing — the app can still run but Supabase calls will fail.
  // Set these in a local `.env` or in your hosting platform.
  // See .env.example in project root.
  console.warn('[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set')
}

export const supabase: SupabaseClient = createClient(SUPABASE_URL ?? '', SUPABASE_ANON_KEY ?? '')

export default supabase
