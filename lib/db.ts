import { createClient } from "@supabase/supabase-js";

// Hanya dipakai di server (Server Component / Route Handler). Jangan import di file "use client".
export const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost",
  process.env.SUPABASE_SERVICE_KEY || "missing",
  {
    auth: { persistSession: false },
    global: { fetch: (u: any, o: any) => fetch(u, { ...o, cache: "no-store" }) },
  }
);
