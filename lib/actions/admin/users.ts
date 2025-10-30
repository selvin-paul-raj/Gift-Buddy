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
  userId: string,
  patch: Partial<{ name: string; birthday: string | null; upi_id: string | null; phone: string | null }>
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Unauthorized");
  await isSystemAdmin(user.id);

  const { error } = await supabase.from("users").update(patch).eq("id", userId);
  if (error) throw error;

  revalidatePath("/admin");
}

export async function adminDeleteUser(userId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Unauthorized");
  await isSystemAdmin(user.id);

  // Delete all contributions by this user first
  await supabase
    .from("contributions")
    .delete()
    .eq("contributor_id", userId);

  const { error } = await supabase.from("users").delete().eq("id", userId);
  if (error) throw error;

  revalidatePath("/admin");
}

export async function adminCreateUser(data: {
  name: string;
  birthday?: string | null;
  upi_id?: string | null;
  phone?: string | null;
}): Promise<AdminUserRow> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Unauthorized");
  await isSystemAdmin(user.id);

  const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const { data: newUser, error } = await supabase
    .from("users")
    .insert([
      {
        id: newId,
        name: data.name,
        birthday: data.birthday || null,
        upi_id: data.upi_id || null,
        phone: data.phone || null,
        role: "user",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/admin");
  
  return {
    id: newUser.id,
    name: newUser.name,
    birthday: newUser.birthday,
  } as AdminUserRow;
}
