import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import AdminCreateEventForm from "@/components/forms/AdminCreateEventForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Create Birthday Event",
};

export default async function CreateEventPage() {
  const supabase = await createClient();

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  // Check if admin
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userError || userData?.role !== "admin") {
    redirect("/dashboard");
  }

  // Get all users for selection
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, name")
    .order("name");

  if (usersError || !users) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <p className="text-red-500">Failed to load users. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 lg:mb-12 space-y-4">
          <Link href="/admin">
            <Button variant="outline" className="mb-4 border-border hover:bg-accent">
              <ArrowLeft className="mr-2" size={18} />
              Back to Dashboard
            </Button>
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
              <span className="text-4xl">🎉</span>
              Create Birthday Event
            </h1>
            <p className="text-muted-foreground text-base">Set up a new celebration with gifts and automatic cost splitting</p>
          </div>
        </div>

        {/* Form */}
        <AdminCreateEventForm users={users as any} />
      </div>
    </div>
  );
}
