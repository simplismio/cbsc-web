import { createClient } from '@supabase/supabase-js'
import { VITE_SUPABASE_URL } from '$lib/env';
import { VITE_SUPABASE_ANON_KEY } from '$lib/env';

const supabase = createClient(
    // @ts-ignore
    VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY
)
export default supabase;