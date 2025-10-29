"use server";

import { createClient } from "@/lib/supabase/server";

export async function adminUpdateTeam(
  adminId: string,
  teamId: string,
  updates: Partial<{
    name: string;
    description: string;
  }>
) {
  const supabase = await createClient();

  // Verify admin
  const { data: adminUser } = await supabase
    .from("users")
    .select("role")
    .eq("id", adminId)
    .single();

  if (adminUser?.role !== "admin") {
    throw new Error("Unauthorized: Only admins can update teams");
  }

  // Update team
  const { error } = await supabase
    .from("teams")
    .update(updates)
    .eq("id", teamId);

  if (error) throw new Error(error.message);

  return { success: true };
}

export async function adminDeleteTeam(adminId: string, teamId: string) {
  const supabase = await createClient();

  // Verify admin
  const { data: adminUser } = await supabase
    .from("users")
    .select("role")
    .eq("id", adminId)
    .single();

  if (adminUser?.role !== "admin") {
    throw new Error("Unauthorized: Only admins can delete teams");
  }

  // Delete team
  const { error } = await supabase
    .from("teams")
    .delete()
    .eq("id", teamId);

  if (error) throw new Error(error.message);

  return { success: true };
}
