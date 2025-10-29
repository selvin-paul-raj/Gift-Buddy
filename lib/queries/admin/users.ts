import { createClient } from "@/lib/supabase/server";

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string | null;
  birthday: string | null;
};

export async function adminListUsers(): Promise<AdminUserRow[]> {
  const supabase = await createClient();

  // Fetch from your `users` table (assuming you store user data here)
  const { data, error } = await supabase
    .from("users")
    .select("id, name, birthday")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as AdminUserRow[];
}
