import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardContent from "./_components/DashboardContent";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user?.id) {
    redirect("/auth/login");
  }

  // Check if user is admin and redirect
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role === "admin") {
    redirect("/admin");
  }

  return <DashboardContent />;
}
