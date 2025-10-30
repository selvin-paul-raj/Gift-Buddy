"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Check if a user is excluded from an event
 */
export async function isUserExcludedFromEvent(eventId: string, userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("event_exclusions")
    .select("id")
    .eq("event_id", eventId)
    .eq("excluded_user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error checking exclusion:", error);
  }

  return !!data;
}

/**
 * Get all excluded users for an event
 */
export async function getExcludedUsersForEvent(eventId: string): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("event_exclusions")
    .select("excluded_user_id")
    .eq("event_id", eventId);

  if (error) {
    console.error("Error fetching excluded users:", error);
    return [];
  }

  return (data || []).map((record) => record.excluded_user_id);
}

/**
 * Add a user to event exclusions
 */
export async function excludeUserFromEvent(eventId: string, userId: string): Promise<boolean> {
  const supabase = await createClient();

  // Get current user
  const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !currentUser) {
    throw new Error("Not authenticated");
  }

  // Verify current user is admin and event creator
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("created_by")
    .eq("id", eventId)
    .single();

  if (eventError || !event || event.created_by !== currentUser.id) {
    throw new Error("Only event creator can exclude users");
  }

  // Add exclusion
  const { error: insertError } = await supabase
    .from("event_exclusions")
    .insert({
      event_id: eventId,
      excluded_user_id: userId,
    });

  if (insertError) {
    if (insertError.code === "23505") {
      // Unique constraint violation - user already excluded
      return false;
    }
    throw new Error(`Failed to exclude user: ${insertError.message}`);
  }

  return true;
}

/**
 * Remove a user from event exclusions
 */
export async function includeUserInEvent(eventId: string, userId: string): Promise<boolean> {
  const supabase = await createClient();

  // Get current user
  const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !currentUser) {
    throw new Error("Not authenticated");
  }

  // Verify current user is admin and event creator
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("created_by")
    .eq("id", eventId)
    .single();

  if (eventError || !event || event.created_by !== currentUser.id) {
    throw new Error("Only event creator can remove exclusions");
  }

  // Remove exclusion
  const { error: deleteError } = await supabase
    .from("event_exclusions")
    .delete()
    .eq("event_id", eventId)
    .eq("excluded_user_id", userId);

  if (deleteError) {
    throw new Error(`Failed to include user: ${deleteError.message}`);
  }

  return true;
}

/**
 * Get all exclusions for an event with user details
 */
export async function getEventExclusionsWithDetails(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("event_exclusions")
    .select(`
      id,
      excluded_user_id,
      users!event_exclusions_excluded_user_id_fkey(id, name)
    `)
    .eq("event_id", eventId);

  if (error) {
    console.error("Error fetching exclusions:", error);
    return [];
  }

  return data || [];
}
