import EventFormSteps from "@/components/forms/EventFormSteps"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function CreateEventPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }
  
  // Get user's team
  const { data: teamData, error: teamError } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", user.id)
    .single()
  
  if (teamError || !teamData?.team_id) {
    redirect("/dashboard")
  }
  
  // Get team members for this specific team
  const { data: teamMembers, count: memberCount } = await supabase
    .from("team_members")
    .select("users(id, name)", { count: "exact" })
    .eq("team_id", teamData.team_id)
  
  // Flatten the nested user data
  const members = teamMembers?.map((tm: any) => ({
    id: tm.users?.id || "",
    name: tm.users?.name || "Unknown",
  })) || []
  
  return (
    <div>
      <EventFormSteps 
        teamId={teamData.team_id} 
        teamMembers={members}
        totalMemberCount={memberCount || 0}
      />
    </div>
  )
}
