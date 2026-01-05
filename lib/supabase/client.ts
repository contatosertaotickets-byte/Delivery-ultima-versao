"use client"

import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Garante singleton no browser
  if (supabaseClient) return supabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Se ainda não estiver disponível (SSR / build), não quebra a aplicação
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "[Supabase] Variáveis de ambiente não disponíveis no client."
    )
    return null
  }

  supabaseClient = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )

  return supabaseClient
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
