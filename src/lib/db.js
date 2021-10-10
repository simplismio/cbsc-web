import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv';
dotenv.config();


const supabase = createClient(
    // @ts-ignore
    process.env['VITE_SUPABASE_URL'],
    process.env['VITE_SUPABASE_ANON_KEY']


    //import.meta.env.,
    // @ts-ignore
    //import.meta.env.
)
export default supabase;