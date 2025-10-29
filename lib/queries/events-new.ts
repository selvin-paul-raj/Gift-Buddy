"use server";

import { createClient } from "@/lib/supabase/server";
import type { Event, Gift, Contribution, User } from "@/lib/types/database.types";

/**
 * Get all upcoming events (admin can see all, users see only upcoming)
 */
export async function getUpcomingEvents() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("events")
    .select(`
      id,
      title,
      date,
      birthday_person_id,
      created_by,
      status,
      note,
      created_at
    `)
    .eq("status", "upcoming")
    .order("date", { ascending: true });

  if (error) throw new Error(error.message);
  return data as Event[];
}

/**
 * Get event details with gifts and contributions
 */
export async function getEventDetails(eventId: string) {
  const supabase = await createClient();
  
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (eventError) throw new Error(eventError.message);

  const { data: gifts, error: giftsError } = await supabase
    .from("gifts")
    .select("*")
    .eq("event_id", eventId);

  if (giftsError) throw new Error(giftsError.message);

  const { data: contributions, error: contribError } = await supabase
    .from("contributions")
    .select("*")
    .eq("event_id", eventId);

  if (contribError) throw new Error(contribError.message);

  return {
    event: event as Event,
    gifts: gifts as Gift[],
    contributions: contributions as Contribution[],
  };
}

/**
 * Get user's contributions for an event
 */
export async function getUserContributions(eventId: string, userId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("contributions")
    .select("*")
    .eq("event_id", eventId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return data as Contribution[];
}

/**
 * Get all events created by user (for dashboard)
 */
export async function getUserCreatedEvents(userId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("created_by", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Event[];
}

/**
 * Get event details with all related data (gifts, contributions, users)
 */
export async function getEventWithAllDetails(eventId: string) {
  const supabase = await createClient();
  
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (eventError) throw new Error(eventError.message);

  const { data: gifts, error: giftsError } = await supabase
    .from("gifts")
    .select("*")
    .eq("event_id", eventId);

  if (giftsError) throw new Error(giftsError.message);

  const { data: contributions, error: contribError } = await supabase
    .from("contributions")
    .select("*")
    .eq("event_id", eventId);

  if (contribError) throw new Error(contribError.message);

  // Fetch user details for contributions
  const userIds = [...new Set(contributions?.map((c: any) => c.user_id) || [])];
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("*")
    .in("id", userIds);

  if (usersError) throw new Error(usersError.message);

  return {
    event: event as Event,
    gifts: (gifts || []) as Gift[],
    contributions: (contributions || []) as Contribution[],
    users: (users || []) as User[],
  };
}
