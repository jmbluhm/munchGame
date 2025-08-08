import { createClient } from '@supabase/supabase-js';

// For client-side usage (with NEXT_PUBLIC_ prefix)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// For server-side usage (without NEXT_PUBLIC_ prefix)
const serverSupabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serverSupabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client for API routes
export const createServerSupabaseClient = () => {
  if (!serverSupabaseUrl || !serverSupabaseAnonKey) {
    throw new Error(`Missing Supabase environment variables. URL: ${!!serverSupabaseUrl}, Key: ${!!serverSupabaseAnonKey}`);
  }
  return createClient(serverSupabaseUrl, serverSupabaseAnonKey);
};

export interface LeaderboardEntry {
  id: number;
  name: string;
  score: number;
  time: number;
  speed: number;
  timestamp: number;
  created_at: string;
} 