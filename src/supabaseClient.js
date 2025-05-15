import { createClient } from "@supabase/supabase-js"
const supabaseURL = process.env.supabaseURL
const supabaseKey = process.env.supabaseKey
const supabase = createClient(supabaseURL, supabaseKey)

export default supabase 