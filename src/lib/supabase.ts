import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rebfcchrzpfteambeurb.supabase.co';
const supabaseAnonKey = 'sb_publishable_WqyKnQleMgQjt0YI45-xJw_L28_mvPO';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
