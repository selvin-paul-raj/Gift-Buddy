import { redirect } from "next/navigation";
import { getEventDetails } from "@/lib/queries/events-new";
import { createClient } from "@/lib/supabase/server";
import EventDetailClient from "./_components/EventDetailClient";

export default async function EventPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/auth/login");

  const payload = await getEventDetails(params.id);

  return (
    <EventDetailClient
      event={payload.event}
      contributions={payload.contributions}
      food={[]}
      currentUserId={data.user.id}
    />
  );
}
