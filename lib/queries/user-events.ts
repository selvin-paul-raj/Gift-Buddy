import { createClient } from "@/lib/supabase/server";
import { Event, Gift, Contribution } from "@/lib/types/database.types";

interface UserEventWithDetails extends Event {
  gifts: Gift[];
  user_contributions: Contribution[];
  total_events_amount: number;
}

interface UserContributionDetail extends Contribution {
  event?: Event;
  gift?: Gift;
  users?: { name: string; upi_id: string | null };
}

/**
 * Get upcoming events for a user with their contributions
 */
export async function getUpcomingEventsForUser(
  userId: string
): Promise<UserEventWithDetails[]> {
  const supabase = await createClient();

  // Get all upcoming events
  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("*")
    .eq("status", "upcoming")
    .order("date", { ascending: true });

  if (eventsError) throw new Error(eventsError.message);

  // For each event, get gifts and user's contributions
  const eventsWithDetails: UserEventWithDetails[] = [];

  for (const event of events || []) {
    // Get gifts for this event
    const { data: gifts, error: giftsError } = await supabase
      .from("gifts")
      .select("*")
      .eq("event_id", event.id);

    if (giftsError) {
      console.error("Failed to fetch gifts:", giftsError);
      continue;
    }

    // Get user's contributions for this event
    const { data: contributions, error: contribError } = await supabase
      .from("contributions")
      .select("*")
      .eq("event_id", event.id)
      .eq("user_id", userId);

    if (contribError) {
      console.error("Failed to fetch contributions:", contribError);
      continue;
    }

    const totalAmount = (contributions || []).reduce((sum, c) => sum + c.split_amount, 0);

    eventsWithDetails.push({
      ...event,
      gifts: (gifts || []) as Gift[],
      user_contributions: (contributions || []) as Contribution[],
      total_events_amount: totalAmount,
    });
  }

  return eventsWithDetails;
}

/**
 * Get user's all contributions across events
 */
export async function getUserContributions(userId: string): Promise<UserContributionDetail[]> {
  const supabase = await createClient();

  const { data: contributions, error: contribError } = await supabase
    .from("contributions")
    .select(
      `
      id,
      event_id,
      user_id,
      gift_id,
      split_amount,
      paid,
      payment_time,
      created_at,
      events(id, title, date, status),
      gifts(id, gift_name, total_amount)
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (contribError) throw new Error(contribError.message);

  return (contributions || []) as UserContributionDetail[];
}

/**
 * Get user's payment status for an event
 */
export async function getUserPaymentStatusForEvent(
  eventId: string,
  userId: string
): Promise<{
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  paid_status: boolean;
  payment_time?: string;
}> {
  const supabase = await createClient();

  const { data: contributions, error: contribError } = await supabase
    .from("contributions")
    .select("amount, paid, created_at")
    .eq("event_id", eventId)
    .eq("user_id", userId);

  if (contribError) throw new Error(contribError.message);

  const totalAmount = (contributions || []).reduce((sum, c) => sum + c.amount, 0);
  const paidAmount = (contributions || [])
    .filter((c) => c.paid)
    .reduce((sum, c) => sum + c.amount, 0);
  const pendingAmount = totalAmount - paidAmount;
  const isPaid = (contributions || []).every((c) => c.paid);
  const paymentTime = (contributions || []).find((c) => c.paid)?.created_at;

  return {
    total_amount: totalAmount / 100, // Convert paise to rupees
    paid_amount: paidAmount / 100,
    pending_amount: pendingAmount / 100,
    paid_status: isPaid,
    payment_time: paymentTime,
  };
}
