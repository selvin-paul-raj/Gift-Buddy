"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { AdminContributionRow } from "@/lib/types/shared.types";
import { isSystemAdmin } from "./is-system-admin";

export async function adminListContributions(currentUserId: string): Promise<AdminContributionRow[]> {
  await isSystemAdmin(currentUserId);

  const supabase = await createClient();
  
  // First get all contributions
  const { data: contributions, error: contribError } = await supabase
    .from("contributions")
    .select(`
      id,
      event_id,
      user_id,
      split_amount,
      paid,
      created_at,
      users ( name ),
      events ( date, title )
    `)
    .order("created_at", { ascending: false });

  if (contribError) throw contribError;

  // For each contribution, fetch the gifts for that event
  const enrichedContributions = await Promise.all(
    (contributions || []).map(async (contrib: any) => {
      const { data: gifts, error: giftsError } = await supabase
        .from("gifts")
        .select("gift_name")
        .eq("event_id", contrib.event_id);

      if (!giftsError && gifts && gifts.length > 0) {
        const giftNames = gifts.map((g: any) => g.gift_name).join(", ");
        return {
          ...contrib,
          events: {
            ...contrib.events,
            giftNames,
          },
        };
      }
      return contrib;
    })
  );

  return enrichedContributions as unknown as AdminContributionRow[];
}

export async function adminUpdateContribution(
  currentUserId: string,
  contributionId: string,
  patch: Partial<{ split_amount: number; paid: boolean }>
) {
  await isSystemAdmin(currentUserId);

  const supabase = await createClient();
  const { error } = await supabase
    .from("contributions")
    .update(patch)
    .eq("id", contributionId);
  if (error) throw error;

  revalidatePath("/admin");
}

export async function adminDeleteContribution(currentUserId: string, contributionId: string) {
  await isSystemAdmin(currentUserId);

  const supabase = await createClient();
  const { error } = await supabase.from("contributions").delete().eq("id", contributionId);
  if (error) throw error;

  revalidatePath("/admin");
}
