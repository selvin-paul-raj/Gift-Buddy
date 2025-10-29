import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HistoryList from "./_components/HistoryList";
import { getUpcomingEvents } from "@/lib/queries/events-new";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user?.id) {
    redirect("/auth/login");
  }

  // Get all events (past and present)
  const allEvents = await getUpcomingEvents();
  
  // Filter to show completed events (history)
  const history = allEvents.filter((e: any) => e.status === 'completed' || e.status === 'cancelled');

  return (
    <div className="p-4 space-y-6">
      <HistoryList data={history} />
    </div>
  );
}
