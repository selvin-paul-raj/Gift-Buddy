import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminDashboardStats, getAdminEventsList } from "@/lib/queries/admin-events";
import AdminSummaryCards from "./_components/AdminSummaryCards";
import EventsListGrid from "./_components/EventsListGrid";
import EventsCrudTable from "./_components/EventsCrudTable";
import ContributionsTable from "./_components/ContributionsTable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Plus, Grid, List, DollarSign } from "lucide-react";
import { adminListEvents } from "@/lib/actions/admin/events";
import { adminListContributions } from "@/lib/queries/admin/contributions";

export default async function AdminPage() {
  const supabase = await createClient();

  // Check if user is authenticated and is admin
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Check if user is admin
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "admin") {
    redirect("/dashboard");
  }

  try {
    // Fetch admin statistics
    const stats = await getAdminDashboardStats();

    // Fetch all events
    const events = await getAdminEventsList();
    
    // Fetch events for CRUD operations
    const crudEvents = await adminListEvents(user.id);

    // Fetch contributions
    const contributions = await adminListContributions(user.id);

    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground flex items-center gap-2">
                🎉 Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                Manage events, track payments & monitor contributions
              </p>
            </div>
            <Link href="/admin/event/create">
              <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <Plus size={18} />
                <span className="text-sm sm:text-base">New Event</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdminSummaryCards stats={stats} />
        </div>

        {/* Events Management Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">📋 Management</h2>
          </div>
          
          <Tabs defaultValue="events" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-secondary border border-border rounded-lg mb-6">
              <TabsTrigger value="events" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:text-foreground text-xs sm:text-sm">
                <List size={16} />
                <span className="hidden sm:inline">Events</span>
                <span className="sm:hidden">Events</span>
              </TabsTrigger>
              <TabsTrigger value="grid" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:text-foreground text-xs sm:text-sm">
                <Grid size={16} />
                <span className="hidden sm:inline">Grid</span>
                <span className="sm:hidden">Grid</span>
              </TabsTrigger>
              <TabsTrigger value="contributions" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:text-foreground text-xs sm:text-sm">
                <DollarSign size={16} />
                <span className="hidden sm:inline">Contributions</span>
                <span className="sm:hidden">Contrib</span>
              </TabsTrigger>
            </TabsList>

            {/* Table View - Full CRUD */}
            <TabsContent value="events" className="mt-6">
              <EventsCrudTable events={crudEvents} currentUserId={user.id} />
            </TabsContent>

            {/* Grid View - Quick Overview */}
            <TabsContent value="grid" className="mt-6">
              <EventsListGrid events={events} />
            </TabsContent>

            {/* Contributions View */}
            <TabsContent value="contributions" className="mt-6">
              <ContributionsTable currentUserId={user.id} contributions={contributions} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading admin dashboard:", error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">Unable to load admin dashboard. Please try again.</p>
          <Link href="/dashboard">
            <Button variant="outline" className="rounded-lg">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }
}
