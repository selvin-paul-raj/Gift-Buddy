import { createClient } from "@/lib/supabase/server";

export async function isSystemAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("isSystemAdmin error", error);
    return false;
  }
  
  // Check if user role is 'admin'
  return data?.role === "admin";
}
