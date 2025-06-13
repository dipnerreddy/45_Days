// src/lib/supabase/edge-client.ts
import { createClient } from '@supabase/supabase-js';

// This is a special, lightweight client that uses the public anon key.
// It is safe to use in Edge functions for read-only operations.
export const createEdgeSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};