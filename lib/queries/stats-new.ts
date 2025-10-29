import { createClient } from "@/lib/supabase/server";
import { StatsProps } from "@/lib/types/shared.types";

/**
 * Get dashboard statistics for the new gift-based schema
 * Calculates:
 * - activeEvents: number of upcoming events
 * - totalMembers: total unique participants across events
 * - collected: total amount collected through contributions
 * - participation: percentage of contributions marked as paid
 */
export async function getDashboardStats(): Promise<StatsProps> {
  const supabase = await createClient();

  try {
    // Get all events (not just upcoming)
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("id, status, created_at");

    if (eventsError) {
      console.error("Failed to fetch events:", eventsError);
      return getDefaultStats();
    }

    // Count upcoming events (status = 'upcoming')
    const activeEvents = events?.filter((e) => e.status === "upcoming").length || 0;

    // Get all unique participants from events
    // For the new schema, we need to count unique users who were assigned events
    // Since events don't have explicit participant lists in the schema,
    // we'll count users who have contributions
    const { data: contributions, error: contributionsError } = await supabase
      .from("contributions")
      .select("user_id, split_amount, paid", { count: "exact" });

    if (contributionsError) {
      console.error("Failed to fetch contributions:", contributionsError);
      return getDefaultStats();
    }

    // Count unique members (users with contributions)
    const uniqueMembers = new Set(contributions?.map((c) => c.user_id) || []);
    const totalMembers = uniqueMembers.size;

    // Calculate total collected
    const collected = contributions?.reduce((sum, c) => sum + (c.split_amount || 0), 0) || 0;
    const collectedFormatted = `₹${(collected / 100).toFixed(2)}`;

    // Calculate participation rate (% of contributions marked as paid)
    const totalContributions = contributions?.length || 0;
    const paidContributions = contributions?.filter((c) => c.paid).length || 0;
    const participationRate =
      totalContributions > 0 ? Math.round((paidContributions / totalContributions) * 100) : 0;
    const participationFormatted = `${participationRate}%`;

    // Calculate percentage changes (comparing to previous month)
    // For now, using placeholder logic - could be enhanced with historical tracking
    const activeEventsChange = calculateChange(activeEvents, 2); // Assume 2 was last month
    const totalMembersChange = calculateChange(totalMembers, totalMembers - 1);
    const collectedChange = calculateChange(collected, collected * 0.8); // Assume 80% was last month
    const participationChange = calculateChange(participationRate, participationRate - 5);

    return {
      activeEvents,
      activeEventsChange,
      totalMembers,
      totalMembersChange,
      collected: collectedFormatted,
      collectedChange,
      participation: participationFormatted,
      participationChange,
    };
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    return getDefaultStats();
  }
}

/**
 * Helper function to calculate percentage change
 * Returns formatted string like "+10%" or "-5%"
 */
function calculateChange(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "+100%" : "0%";

  const change = ((current - previous) / Math.abs(previous)) * 100;
  const sign = change >= 0 ? "+" : "";
  return `${sign}${Math.round(change)}%`;
}

/**
 * Default stats to return on error
 */
function getDefaultStats(): StatsProps {
  return {
    activeEvents: 0,
    activeEventsChange: "+0%",
    totalMembers: 0,
    totalMembersChange: "+0%",
    collected: "₹0.00",
    collectedChange: "+0%",
    participation: "0%",
    participationChange: "+0%",
  };
}
