"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseEnv } from "./env";

export function getSupabaseBrowserClient() {
  if (!supabaseEnv.url || !supabaseEnv.anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createBrowserClient(supabaseEnv.url, supabaseEnv.anonKey);
}

