import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req, res) {
  const { data, error } = await supabase.from("customers").select("*").limit(1);
  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).json({ error });
  }
  res.status(200).json({ data });
}
