"use server";

import { createClient } from "@/lib/supabase/server";

export async function createEvent(form: {
  title: string;
  description?: string;
  date: string;
  amount: number;
  teamId: string;
  birthdayPersonId: string;
  participantIds: string[];
  foodOptions: string[];
  upiId?: string;
  phoneNumber?: string;
}) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id;
  if (!userId) throw new Error("Not authenticated");

  const { data: event, error: eventError } = await supabase
    .from("events")
    .insert({
      team_id: form.teamId,
      date: form.date,
      title: form.title,
      note: form.description,
      created_by: userId,
      birthday_person_id: form.birthdayPersonId,
      upi_id: form.upiId,
      phone: form.phoneNumber,
    })
    .select()
    .single();

  if (eventError) throw new Error(eventError.message);

  // Include admin/creator in the contribution split
  const allContributors = [userId, ...form.participantIds];
  
  const contributions = allContributors.map((uid) => ({
    event_id: event.id,
    user_id: uid,
    amount: form.amount,
  }));

  const { error: contribError } = await supabase
    .from("contributions")
    .insert(contributions);
  if (contribError) throw new Error(contribError.message);

  if (form.foodOptions && form.foodOptions.length > 0) {
    const { error: foodError } = await supabase
      .from("food_options")
      .insert(
        form.foodOptions.map((title) => ({
          event_id: event.id,
          title,
        }))
      );
    if (foodError) throw new Error(foodError.message);
  }

  await supabase.from("event_managers").insert({ event_id: event.id, user_id: userId });

  return { success: true, eventId: event.id };
}
