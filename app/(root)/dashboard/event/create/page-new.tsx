import EventForm from "@/components/forms/EventForm-new"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function CreateEventPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  if (userError || userData?.role !== 'admin') {
    redirect("/dashboard")
  }

  // Get all users to display in the form
  const { data: allUsers, error: usersError } = await supabase
    .from("users")
    .select("*")
    .order("name", { ascending: true })

  if (usersError) {
    throw new Error(usersError.message)
  }

  return (
    <EventForm allUsers={allUsers || []} />
  )
}
