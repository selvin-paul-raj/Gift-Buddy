"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSystemAdmin } from "@/lib/queries/admin/is-system-admin";
import { AdminEventRow, EventStatus } from "@/lib/types/shared.types";

export async function adminListEvents(currentUserId: string): Promise<AdminEventRow[]> {
  await isSystemAdmin(currentUserId);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(`
      id,
      title,
      date,
      status,
      note,
      created_at,
      birthday_person:users!events_birthday_person_id_fkey ( name )
    `)
    .order("date", { ascending: false });

  if (error) throw error;
  return (data || []) as unknown as AdminEventRow[];
}

export async function adminUpdateEvent(
  currentUserId: string,
  eventId: string,
  patch: Partial<{ status: EventStatus; note: string | null; date: string; title: string; upi_id: string | null; phone: string | null }>
) {
  await isSystemAdmin(currentUserId);

  const supabase = await createClient();
  const { error } = await supabase.from("events").update(patch).eq("id", eventId);
  if (error) throw error;

  revalidatePath("/admin");
}

export async function adminDeleteEvent(currentUserId: string, eventId: string) {
  await isSystemAdmin(currentUserId);

  const supabase = await createClient();
  
  // Delete contributions first (cascade)
  await supabase.from("contributions").delete().eq("event_id", eventId);
  
  // Delete gifts
  await supabase.from("gifts").delete().eq("event_id", eventId);
  
  // Delete event
  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

/**
 * Create a new event (admin)
 */
export async function adminCreateEvent(
  currentUserId: string,
  eventData: {
    title: string;
    date: string;
    status?: EventStatus;
    birthday_person_id: string;
    note?: string;
    amount?: number;
    upi_id?: string;
    phone?: string;
  }
) {
  await isSystemAdmin(currentUserId);

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .insert([
      {
        title: eventData.title,
        date: eventData.date,
        status: eventData.status || "upcoming",
        birthday_person_id: eventData.birthday_person_id,
        created_by: currentUserId,
        note: eventData.note,
        amount: eventData.amount || 0,
        upi_id: eventData.upi_id,
        phone: eventData.phone,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  return data;
}

/**
 * Bulk update events status
 */
export async function adminBulkUpdateStatus(
  currentUserId: string,
  eventIds: string[],
  status: EventStatus
) {
  await isSystemAdmin(currentUserId);

  const supabase = await createClient();

  const { error } = await supabase
    .from("events")
    .update({ status })
    .in("id", eventIds);

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

/**
 * Clone an event (duplicate with new date)
 */
export async function adminCloneEvent(
  currentUserId: string,
  eventId: string,
  newDate: string
) {
  await isSystemAdmin(currentUserId);

  const supabase = await createClient();

  // Get original event
  const { data: original, error: fetchError } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (fetchError || !original) throw new Error("Event not found");

  // Create new event
  const { data: newEvent, error: createError } = await supabase
    .from("events")
    .insert([
      {
        title: original.title,
        date: newDate,
        status: "upcoming" as EventStatus,
        birthday_person_id: original.birthday_person_id,
        created_by: currentUserId,
        note: original.note,
        amount: original.amount,
        upi_id: original.upi_id,
        phone: original.phone,
      },
    ])
    .select()
    .single();

  if (createError) throw new Error(createError.message);

  // Copy gifts from original event
  const { data: originalGifts } = await supabase
    .from("gifts")
    .select("*")
    .eq("event_id", eventId);

  if (originalGifts && originalGifts.length > 0) {
    const newGifts = originalGifts.map(({ id, created_at, ...gift }) => ({
      ...gift,
      event_id: newEvent.id,
    }));

    await supabase.from("gifts").insert(newGifts);
  }

  revalidatePath("/admin");
  return newEvent;
}

/**
 * Update event UPI ID and Phone (CRUD - Update)
 */
export async function adminUpdateEventPaymentContact(
  currentUserId: string,
  eventId: string,
  paymentData: {
    upi_id?: string | null;
    phone?: string | null;
  }
) {
  await isSystemAdmin(currentUserId);

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .update({
      upi_id: paymentData.upi_id,
      phone: paymentData.phone,
    })
    .eq("id", eventId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  return data;
}

/**
 * Get event payment contact info (CRUD - Read)
 */
export async function adminGetEventPaymentContact(
  currentUserId: string,
  eventId: string
) {
  await isSystemAdmin(currentUserId);

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("id, title, upi_id, phone")
    .eq("id", eventId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Delete event UPI and phone (CRUD - Delete/Clear)
 */
export async function adminClearEventPaymentContact(
  currentUserId: string,
  eventId: string
) {
  await isSystemAdmin(currentUserId);

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .update({
      upi_id: null,
      phone: null,
    })
    .eq("id", eventId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  return data;
}

