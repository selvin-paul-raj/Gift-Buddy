import { createClient } from "@/lib/supabase/server";
import { Event, Gift, Contribution, User } from "@/lib/types/database.types";

interface EventWithStats extends Event {
  total_contributions: number;
  total_collected: number;
  total_pending: number;
  gifts_count: number;
}

interface ContributionWithUser extends Contribution {
  users: Array<{ id: string; name: string; upi_id: string | null }>;
}

interface EventDetailResponse {
  event: Event;
  gifts: Gift[];
  contributions: ContributionWithUser[];
  summary: {
    total_amount: number;
    total_collected: number;
    total_pending: number;
    contributions_count: number;
    paid_count: number;
  };
}

/**
 * Get all events for admin with statistics
 */
export async function getAdminEventsList(): Promise<EventWithStats[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select(
      `
      id,
      title,
      date,
      status,
      birthday_person_id,
      created_by,
      note,
      created_at,
      upi_id,
      phone
    `
    )
    .order("date", { ascending: false });

  if (error) {
    console.error("Failed to fetch admin events:", error);
    throw new Error(error.message);
  }

  // Fetch contributions and calculate stats for each event
  const eventsWithStats: EventWithStats[] = [];

  for (const event of data || []) {
    const { data: contributions, error: contribError } = await supabase
      .from("contributions")
      .select("split_amount, paid")
      .eq("event_id", event.id);

    if (contribError) {
      console.error("Failed to fetch contributions:", contribError);
      eventsWithStats.push({
        ...event,
        total_contributions: 0,
        total_collected: 0,
        total_pending: 0,
        gifts_count: 0,
        upi_id: event.upi_id || "",
        phone: event.phone || "",
      });
      continue;
    }

    const { data: gifts, error: giftsError } = await supabase
      .from("gifts")
      .select("id")
      .eq("event_id", event.id);

    const total_collected = (contributions || []).reduce((sum, c) => {
      return sum + (c.paid ? c.split_amount : 0);
    }, 0);

    const total_pending = (contributions || []).reduce((sum, c) => {
      return sum + (!c.paid ? c.split_amount : 0);
    }, 0);

    eventsWithStats.push({
      ...event,
      total_contributions: contributions?.length || 0,
      total_collected,
      total_pending,
      gifts_count: gifts?.length || 0,
    });
  }

  return eventsWithStats;
}

/**
 * Get single event with all details for admin view
 */
export async function getEventDetailForAdmin(
  eventId: string
): Promise<EventDetailResponse> {
  const supabase = await createClient();

  // Get event
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (eventError) throw new Error(eventError.message);

  // Get gifts
  const { data: gifts, error: giftsError } = await supabase
    .from("gifts")
    .select("*")
    .eq("event_id", eventId);

  if (giftsError) throw new Error(giftsError.message);

  // Get contributions with user details
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
      users!inner(id, name, upi_id)
    `
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (contribError) throw new Error(contribError.message);

  // Calculate summary
  const summary = {
    total_amount: (contributions || []).reduce((sum, c) => sum + c.split_amount, 0),
    total_collected: (contributions || [])
      .filter((c) => c.paid)
      .reduce((sum, c) => sum + c.split_amount, 0),
    total_pending: (contributions || [])
      .filter((c) => !c.paid)
      .reduce((sum, c) => sum + c.split_amount, 0),
    contributions_count: contributions?.length || 0,
    paid_count: contributions?.filter((c) => c.paid).length || 0,
  };

  return {
    event: event as Event,
    gifts: (gifts || []) as Gift[],
    contributions: (contributions || []) as ContributionWithUser[],
    summary,
  };
}

/**
 * Get admin dashboard statistics
 */
export async function getAdminDashboardStats() {
  const supabase = await createClient();

  // Get all events with contribution stats
  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("id, status, created_at");

  if (eventsError) throw new Error(eventsError.message);

  const { data: allContributions, error: contribError } = await supabase
    .from("contributions")
    .select("split_amount, paid");

  if (contribError) throw new Error(contribError.message);

  const totalEvents = events?.length || 0;
  const completedEvents = events?.filter((e) => e.status === "completed").length || 0;
  const upcomingEvents = events?.filter((e) => e.status === "upcoming").length || 0;

  const totalCollected = (allContributions || [])
    .filter((c) => c.paid)
    .reduce((sum, c) => sum + c.split_amount, 0);

  const totalPending = (allContributions || [])
    .filter((c) => !c.paid)
    .reduce((sum, c) => sum + c.split_amount, 0);

  return {
    totalEvents,
    completedEvents,
    upcomingEvents,
    totalCollected: totalCollected / 100, // Convert paise to rupees
    totalPending: totalPending / 100,
    totalContributions: allContributions?.length || 0,
    paidContributions: allContributions?.filter((c) => c.paid).length || 0,
  };
}
