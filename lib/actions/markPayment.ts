"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Mark a contribution as paid
 */
export async function markContributionAsPaid(eventId: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "Not authenticated",
    };
  }

  try {
    // Get all contributions for this event by the current user
    const { data: contributions, error: getError } = await supabase
      .from("contributions")
      .select("id, user_id, event_id")
      .eq("event_id", eventId)
      .eq("user_id", user.id);

    if (getError || !contributions || contributions.length === 0) {
      return {
        success: false,
        error: "No contributions found for this event",
      };
    }

    // Update all contributions for this user in this event
    const { data, error } = await supabase
      .from("contributions")
      .update({
        paid: true,
        payment_time: new Date().toISOString(),
      })
      .eq("event_id", eventId)
      .eq("user_id", user.id)
      .select();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate the dashboard and event detail pages
    revalidatePath("/dashboard");
    revalidatePath("/admin");

    return {
      success: true,
      data,
      message: "✅ Payment marked successfully!",
    };
  } catch (error) {
    console.error("Error marking payment:", error);
    return {
      success: false,
      error: "Failed to mark payment",
    };
  }
}

/**
 * Mark event as completed (admin only)
 */
export async function markEventAsCompleted(eventId: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "Not authenticated",
    };
  }

  try {
    // Verify user is admin and owns the event
    const { data: event, error: getError } = await supabase
      .from("events")
      .select("created_by")
      .eq("id", eventId)
      .single();

    if (getError || event.created_by !== user.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Update event status
    const { data, error } = await supabase
      .from("events")
      .update({
        status: "completed",
      })
      .eq("id", eventId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath("/admin");

    return {
      success: true,
      data,
      message: "✅ Event marked as completed!",
    };
  } catch (error) {
    console.error("Error marking event completed:", error);
    return {
      success: false,
      error: "Failed to mark event as completed",
    };
  }
}

/**
 * Update contribution amount (admin only - in case of corrections)
 */
export async function updateContributionAmount(
  contributionId: string,
  newAmount: number
) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "Not authenticated",
    };
  }

  try {
    // Get contribution and event to verify admin ownership
    const { data: contribution, error: getError } = await supabase
      .from("contributions")
      .select("event_id")
      .eq("id", contributionId)
      .single();

    if (getError) {
      return {
        success: false,
        error: "Contribution not found",
      };
    }

    // Verify event belongs to user (admin)
    const { data: event } = await supabase
      .from("events")
      .select("created_by")
      .eq("id", contribution.event_id)
      .single();

    if (event?.created_by !== user.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Update contribution
    const { data, error } = await supabase
      .from("contributions")
      .update({
        amount: Math.round(newAmount * 100), // Convert to paise
      })
      .eq("id", contributionId)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath("/admin");

    return {
      success: true,
      data,
      message: "✅ Amount updated!",
    };
  } catch (error) {
    console.error("Error updating amount:", error);
    return {
      success: false,
      error: "Failed to update amount",
    };
  }
}
