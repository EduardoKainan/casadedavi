import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let browserClient: SupabaseClient | null = null;
let serverClient: SupabaseClient | null = null;

function createSupabaseClient(key: string) {
  return createClient(supabaseUrl!, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getSupabaseClient() {
  const isBrowser = typeof window !== "undefined";
  const supabaseKey = isBrowser ? supabaseAnonKey : supabaseServiceRoleKey || supabaseAnonKey;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      isBrowser
        ? "Supabase não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
        : "Supabase não configurado no servidor. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  if (isBrowser) {
    browserClient ??= createSupabaseClient(supabaseKey);
    return browserClient;
  }

  serverClient ??= createSupabaseClient(supabaseKey);
  return serverClient;
}
