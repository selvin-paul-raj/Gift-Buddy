"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSystemAdmin } from "@/lib/queries/admin/is-system-admin";
import { AdminUserRow } from "@/lib/queries/admin/users";

export async function adminListUsers(currentUserId: string): Promise<AdminUserRow[]> {
  await isSystemAdmin(currentUserId);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, name, birthday");
  if (error) throw error;

  return (data || []).map((u) => ({
    id: u.id,
    name: u.name,
    birthday: u.birthday,
    email: null, // not available from public.users
  }));
}

export async function adminUpdateUser(
  currentUserId: string,
  userId: string,
  patch: Partial<{ name: string; birthday: string }>
) {
  await isSystemAdmin(currentUserId);

  const supabase = await createClient();
  const { error } = await supabase.from("users").update(patch).eq("id", userId);
  if (error) throw error;

  revalidatePath("/admin");
}

export async function adminDeleteUser(currentUserId: string, userId: string) {
  await isSystemAdmin(currentUserId);

  const supabase = await createClient();
  const { error } = await supabase.from("users").delete().eq("id", userId);
  if (error) throw error;

  // Deleting from auth.users requires service role. Do that in a Route Handler / Edge Function if needed.
  revalidatePath("/admin");
}
