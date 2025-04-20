import { createClient } from '@supabase/supabase-js'

// Use import.meta.env for Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is missing. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file and the dev server was restarted.');
}

// Initialize client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Add a check for the client elsewhere if needed, or handle the null case:
// if (!supabase) { /* Handle error or loading state */ } 