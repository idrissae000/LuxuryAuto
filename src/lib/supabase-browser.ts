import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "local-dev-anon-key";

export const createSupabaseBrowserClient = () => createBrowserClient(supabaseUrl, supabaseAnonKey);
