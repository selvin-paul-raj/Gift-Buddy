"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface GiftInput {
  name: string;
  link?: string;
  estimatedCost: number; // in rupees
}

interface CreateEventInput {
  title: string;
  date: string;
  birthdayPersonId: string;
  gifts: GiftInput[];
  upiId?: string;
  phoneNumber?: string;
  excludedUserIds?: string[]; // New: User IDs to exclude from this event
}

export async function createEventWithGifts(input: CreateEventInput) {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Not authenticated");
  }

  // Check if user is admin
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userError || userData?.role !== "admin") {
    throw new Error("Only admins can create events");
  }

  // Get all users count (for cost splitting - everyone except birthday person)
  const { data: allUsers, error: usersError } = await supabase
    .from("users")
    .select("id");

  if (usersError || !allUsers) {
    throw new Error("Could not fetch users");
  }

  const totalUsers = allUsers.length;
  const usersToSplit = totalUsers - 1; // Exclude birthday person

  if (usersToSplit <= 0) {
    throw new Error("Not enough users for event");
  }

  // Calculate actual split users (exclude birthday person + excluded users)
  const excludedUserIds = input.excludedUserIds || [];
  const actualSplitUsers = allUsers.filter(
    (u) => u.id !== input.birthdayPersonId && !excludedUserIds.includes(u.id)
  );

  if (actualSplitUsers.length <= 0) {
    throw new Error("At least one user must participate in cost splitting");
  }

  try {
    // 1. Create event
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .insert({
        title: input.title,
        date: input.date,
        birthday_person_id: input.birthdayPersonId,
        created_by: user.id,
        status: "upcoming",
        note: "",
        upi_id: input.upiId || null,
        phone: input.phoneNumber || null,
      })
      .select()
      .single();

    if (eventError) throw new Error(`Event creation failed: ${eventError.message}`);

    const eventId = eventData.id;

    // 2. Create gifts and get their data
    const giftInserts = input.gifts.map((gift) => ({
      event_id: eventId,
      gift_name: gift.name,
      gift_link: gift.link || "",
      total_amount: Math.round(gift.estimatedCost * 100), // Convert to paise
    }));

    const { data: giftsData, error: giftsError } = await supabase
      .from("gifts")
      .insert(giftInserts)
      .select("id, gift_name, total_amount");

    if (giftsError) throw new Error(`Gift creation failed: ${giftsError.message}`);

    // 3. Create contributions (one for each user except birthday person and excluded users)
    // Calculate total split amount across all gifts
    const totalGiftAmount = giftsData.reduce((sum, gift) => sum + gift.total_amount, 0);
    const splitAmountPerUser = Math.round(totalGiftAmount / actualSplitUsers.length);

    const contributionInserts = actualSplitUsers.map((user) => {
      return {
        event_id: eventId,
        user_id: user.id,
        split_amount: splitAmountPerUser,
        paid: false,
        payment_time: null,
      };
    });

    const { error: contributionsError } = await supabase
      .from("contributions")
      .insert(contributionInserts);

    if (contributionsError)
      throw new Error(
        `Contributions creation failed: ${contributionsError.message}`
      );

    // 4. Add exclusions if any
    if (excludedUserIds.length > 0) {
      const exclusionInserts = excludedUserIds.map((userId) => ({
        event_id: eventId,
        excluded_user_id: userId,
      }));

      const { error: exclusionsError } = await supabase
        .from("event_exclusions")
        .insert(exclusionInserts);

      if (exclusionsError)
        throw new Error(
          `Exclusions creation failed: ${exclusionsError.message}`
        );
    }

    // Revalidate paths
    revalidatePath("/admin");
    revalidatePath("/dashboard");

    return {
      success: true,
      eventId,
      message: `Event created successfully with ${giftsData.length} gifts!`,
    };
  } catch (error) {
    console.error("Event creation error:", error);
    throw error;
  }
}
