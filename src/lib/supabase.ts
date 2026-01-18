import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://znkclhnmwlbhwnnhiana.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Uxaa5rKGC6lyeTx5YmauFA_RyktVqOy';

export const supabase = createClient(supabaseUrl, supabaseKey);
