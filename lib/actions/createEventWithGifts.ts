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

    // 3. Create contributions (one for each user except birthday person)
    // Calculate total split amount across all gifts
    const totalGiftAmount = giftsData.reduce((sum, gift) => sum + gift.total_amount, 0);
    const splitAmountPerUser = Math.round(totalGiftAmount / usersToSplit);

    const contributionInserts = allUsers
      .filter((u) => u.id !== input.birthdayPersonId) // Exclude birthday person
      .map((user) => {
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
