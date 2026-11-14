import { createClient } from '@supabase/supabase-js';

export function createStorageAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
