import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://wsxwvckoxargopyuxuwy.supabase.co"
const SUPABASE_KEY = "sb_publishable_BzYv1-H4t4UbNiJPY9uazQ_Has-an7V"

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function check() {
  const { data, error } = await supabase
    .from("college_domains")
    .select("id, domain")
    .eq("domain", "ritchennai.edu.in")
    .eq("is_active", true)

  console.log("Error:", error)
  console.log("Data:", data)
}

check()
