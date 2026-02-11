import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

// Public client for regular operations (read, insert)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for moderation operations (update, delete)
// Only use this in admin contexts with proper authentication
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
