"use server";

import { createClient } from "@/lib/supabase/server";

export interface CreateEventInput {
  title: string;
  description?: string;
  date: string;
  birthdayPersonId: string;
  gifts: Array<{
    name: string;
    link?: string;
    amount: number;
  }>;
  participantUserIds: string[]; // Users who will contribute
}

/**
 * Create a new event with gifts and auto-generate contributions
 */
export async function createEventWithGifts(input: CreateEventInput) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id;

  if (!userId) throw new Error("Not authenticated");

  try {
    // 1. Create event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        title: input.title,
        date: input.date,
        birthday_person_id: input.birthdayPersonId,
        created_by: userId,
        note: input.description || null,
        status: "upcoming",
      })
      .select()
      .single();

    if (eventError) throw new Error(eventError.message);

    // 2. Create gifts
    const giftData = input.gifts.map((gift) => ({
      event_id: event.id,
      gift_name: gift.name,
      gift_link: gift.link || null,
      total_amount: gift.amount,
    }));

    const { data: createdGifts, error: giftsError } = await supabase
      .from("gifts")
      .insert(giftData)
      .select();

    if (giftsError) throw new Error(giftsError.message);

    // 3. Calculate total gifts amount
    const totalGiftsAmount = input.gifts.reduce((sum, gift) => sum + gift.amount, 0);
    const numParticipants = input.participantUserIds.length;
    const perPersonAmount = numParticipants > 0 ? totalGiftsAmount / numParticipants : 0;

    // 4. Create contributions for each participant
    const contributionData = input.participantUserIds.map((userId, index) => ({
      event_id: event.id,
      user_id: userId,
      gift_id: createdGifts?.[0]?.id || null, // Assign to first gift by default
      split_amount: perPersonAmount,
      paid: false,
    }));

    const { error: contribError } = await supabase
      .from("contributions")
      .insert(contributionData);

    if (contribError) throw new Error(contribError.message);

    return {
      success: true,
      eventId: event.id,
      message: `Event created with ${createdGifts?.length || 0} gifts and ${numParticipants} participants`,
    };
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
}

/**
 * Add a gift to an existing event
 */
export async function addGiftToEvent(
  eventId: string,
  giftName: string,
  totalAmount: number,
  giftLink?: string
) {
  const supabase = await createClient();

  try {
    const { data: gift, error } = await supabase
      .from("gifts")
      .insert({
        event_id: eventId,
        gift_name: giftName,
        gift_link: giftLink || null,
        total_amount: totalAmount,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      success: true,
      giftId: gift.id,
      message: "Gift added successfully",
    };
  } catch (error) {
    console.error("Error adding gift:", error);
    throw error;
  }
}

/**
 * Mark contribution as paid
 */
export async function markContributionAsPaid(contributionId: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id;

  if (!userId) throw new Error("Not authenticated");

  try {
    const { error } = await supabase
      .from("contributions")
      .update({
        paid: true,
        payment_time: new Date().toISOString(),
      })
      .eq("id", contributionId)
      .eq("user_id", userId); // Only allow user to mark their own contribution

    if (error) throw new Error(error.message);

    return {
      success: true,
      message: "Contribution marked as paid",
    };
  } catch (error) {
    console.error("Error marking contribution as paid:", error);
    throw error;
  }
}

/**
 * Update event status
 */
export async function updateEventStatus(eventId: string, status: "upcoming" | "completed" | "cancelled") {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id;

  if (!userId) throw new Error("Not authenticated");

  try {
    const { error } = await supabase
      .from("events")
      .update({ status })
      .eq("id", eventId)
      .eq("created_by", userId); // Only event creator can update

    if (error) throw new Error(error.message);

    return {
      success: true,
      message: `Event status updated to ${status}`,
    };
  } catch (error) {
    console.error("Error updating event status:", error);
    throw error;
  }
}
