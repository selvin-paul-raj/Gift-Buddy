"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Create or update user profile in database
 * Called after successful authentication
 * Schema: users (id, name, birthday, upi_id, role, created_at)
 */
export async function createOrUpdateUserProfile(
  userId: string,
  name?: string,
  birthday?: string,
  upiId?: string,
  role: 'user' | 'admin' = 'user'
) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("users")
      .upsert(
        {
          id: userId,
          name: name || null,
          birthday: birthday || null,
          upi_id: upiId || null,
          role: role,
          created_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (error) {
      console.error("Error creating user profile:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("createOrUpdateUserProfile error:", error);
    throw error;
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found
    console.error("Error fetching user profile:", error);
  }

  return data || null;
}
