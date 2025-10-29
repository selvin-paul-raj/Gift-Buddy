import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "./_components/Header";
import UpcomingBirthday from "./_components/UpcomingBirthday";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user?.id) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8 lg:space-y-12">
        <Header />
        <UpcomingBirthday data={[]} />
      </div>
    </div>
  );
}
