import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build, env vars may not be present — use placeholder so the build
  // succeeds. Actual auth calls will fail at runtime without real values, which
  // surfaces as a normal sign-in error rather than a build crash.
  return createBrowserClient(
    url || 'https://placeholder.supabase.co',
    key || 'placeholder-anon-key'
  )
}
