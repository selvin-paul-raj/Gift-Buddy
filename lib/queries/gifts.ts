"use server";

import { createClient } from "@/lib/supabase/server";
import type { Gift, Contribution } from "@/lib/types/database.types";

/**
 * Get all gifts for an event
 */
export async function getEventGifts(eventId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("gifts")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data as Gift[];
}

/**
 * Get gift with all contributions
 */
export async function getGiftWithContributions(giftId: string) {
  const supabase = await createClient();
  
  const { data: gift, error: giftError } = await supabase
    .from("gifts")
    .select("*")
    .eq("id", giftId)
    .single();

  if (giftError) throw new Error(giftError.message);

  const { data: contributions, error: contribError } = await supabase
    .from("contributions")
    .select("*")
    .eq("gift_id", giftId);

  if (contribError) throw new Error(contribError.message);

  return {
    gift: gift as Gift,
    contributions: contributions as Contribution[],
  };
}

/**
 * Calculate total raised for a gift
 */
export async function getGiftTotal(giftId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("contributions")
    .select("split_amount")
    .eq("gift_id", giftId);

  if (error) throw new Error(error.message);

  const total = data?.reduce((sum, c) => sum + (c.split_amount || 0), 0) || 0;
  return total;
}
