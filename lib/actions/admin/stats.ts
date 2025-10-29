"use server";

import { createClient } from "@/lib/supabase/server";
import { AdminStats } from "@/lib/types/shared.types";

export async function adminGetStats(): Promise<AdminStats> {
  const supabase = await createClient();

  const [
    { count: totalUsers },
    { count: activeTeams },
    { count: activeEvents },
    { data: contributions },
  ] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("teams").select("id", { count: "exact", head: true }),
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .not("status", "eq", "cancelled"),
    supabase.from("contributions").select("amount"),
  ]);

  const totalContributions =
    contributions?.reduce((acc, c) => acc + Number(c.amount || 0), 0) || 0;

  return {
    totalUsers: totalUsers || 0,
    activeTeams: activeTeams || 0,
    activeEvents: activeEvents || 0,
    totalContributions,
  };
}
