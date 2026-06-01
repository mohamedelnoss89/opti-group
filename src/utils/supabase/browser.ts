import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    'https://rebfcchrzpfteambeurb.supabase.co',
    'sb_publishable_WqyKnQleMgQjt0YI45-xJw_L28_mvPO'
  )
}
