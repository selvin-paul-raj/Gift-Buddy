import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Clock } from "lucide-react";
import MarkEventButton from "./_components/MarkEventButton";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Event Details",
};

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
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

  // Get event
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (eventError || !event) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <Link href="/admin">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="mr-2" size={18} />
            Back
          </Button>
        </Link>
        <p className="text-red-500">Event not found</p>
      </div>
    );
  }

  // Get birthday person
  const { data: birthdayPerson } = await supabase
    .from("users")
    .select("name")
    .eq("id", event.birthday_person_id)
    .single();

  // Get gifts
  const { data: gifts } = await supabase
    .from("gifts")
    .select("*")
    .eq("event_id", id);

  // Get contributions with user details
  const { data: contributions } = await supabase
    .from("contributions")
    .select(`
      id,
      user_id,
      gift_id,
      split_amount,
      paid,
      payment_time,
      users!inner(id, name)
    `)
    .eq("event_id", id)
    .order("created_at", { ascending: true });

  // Calculate summary
  const totalContributions = contributions?.length || 0;
  const paidContributions = contributions?.filter((c: any) => c.paid).length || 0;
  const totalAmount = contributions?.reduce((sum: number, c: any) => sum + c.split_amount, 0) || 0;
  const paidAmount = contributions?.filter((c: any) => c.paid).reduce((sum: number, c: any) => sum + c.split_amount, 0) || 0;
  const pendingAmount = totalAmount - paidAmount;

  const collectionPercentage =
    totalContributions > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  // Group contributions by user
  const contributionsByUser = contributions?.reduce((acc: any, contrib: any) => {
    const existing = acc.find((item: any) => item.userId === contrib.user_id);
    if (existing) {
      existing.splitAmounts.push({
        giftName: gifts?.find((g: any) => g.id === contrib.gift_id)?.gift_name,
        amount: contrib.split_amount,
      });
      existing.totalAmount += contrib.split_amount;
    } else {
      acc.push({
        userId: contrib.user_id,
        name: contrib.users?.name,
        phone: contrib.users?.phone,
        upiId: contrib.users?.upi_id,
        paid: contrib.paid,
        paymentTime: contrib.payment_time,
        splitAmounts: [
          {
            giftName: gifts?.find((g: any) => g.id === contrib.gift_id)?.gift_name,
            amount: contrib.split_amount,
          },
        ],
        totalAmount: contrib.split_amount,
      });
    }
    return acc;
  }, []) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <Link href="/admin">
            <Button variant="outline" className="mb-4 border-border hover:bg-accent">
              <ArrowLeft className="mr-2" size={18} />
              Back
            </Button>
          </Link>

          <Card className="border-2 bg-card hover:shadow-md transition-shadow">
            <div className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
                    <span className="text-4xl">🎂</span> {event.title}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-3">
                    Birthday Person: <span className="font-semibold text-foreground">{birthdayPerson?.name}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Event Date:{" "}
                    <span className="font-semibold text-foreground">
                      {new Date(event.date).toLocaleDateString("en-IN", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`font-semibold px-3 py-1 rounded text-sm whitespace-nowrap ${
                      event.status === "upcoming"
                        ? "bg-blue-100/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50"
                        : event.status === "completed"
                          ? "bg-green-100/50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-900/50"
                          : "bg-red-100/50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50"
                    }`}
                  >
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                  {event.status === "upcoming" && (
                    <MarkEventButton eventId={id} />
                  )}
                </div>
              </div>
              
              {event.note && (
                <div className="bg-secondary/50 border border-border p-3 rounded-lg">
                  <p className="text-sm text-foreground">
                    📝 <span className="text-muted-foreground">{event.note}</span>
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Summary Stats - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-card border-2 hover:shadow-md transition-shadow">
            <p className="text-sm text-muted-foreground font-medium">Total Gifts</p>
            <p className="text-3xl font-bold text-primary mt-2">{gifts?.length || 0}</p>
          </Card>

          <Card className="p-4 bg-card border-2 hover:shadow-md transition-shadow">
            <p className="text-sm text-muted-foreground font-medium">Total Amount</p>
            <p className="text-3xl font-bold text-primary mt-2">₹{(totalAmount / 100).toFixed(0)}</p>
          </Card>

          <Card className="p-4 bg-card border-2 hover:shadow-md transition-shadow">
            <p className="text-sm text-muted-foreground font-medium">Collected</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">₹{(paidAmount / 100).toFixed(0)}</p>
          </Card>

          <Card className="p-4 bg-card border-2 hover:shadow-md transition-shadow">
            <p className="text-sm text-muted-foreground font-medium">Pending</p>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">₹{(pendingAmount / 100).toFixed(0)}</p>
          </Card>
        </div>

        {/* Collection Progress */}
        <Card className="p-6 bg-card border-2 hover:shadow-md transition-shadow mb-8">
          <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
            📊 Collection Progress
          </h2>
          <div className="bg-muted dark:bg-secondary rounded-full h-8 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-full flex items-center justify-center text-primary-foreground font-bold text-sm transition-all"
              style={{ width: `${collectionPercentage}%` }}
            >
              {collectionPercentage > 15 && `${collectionPercentage}%`}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            <span className="font-semibold text-foreground">{paidContributions}</span> of <span className="font-semibold text-foreground">{totalContributions}</span> contributors have paid
          </p>
        </Card>

        {/* Gifts Section */}
        {gifts && gifts.length > 0 && (
          <Card className="p-6 bg-card border-2 hover:shadow-md transition-shadow mb-8">
            <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
              🎁 Gifts ({gifts.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gifts.map((gift) => (
                <Card key={gift.id} className="p-4 bg-secondary/50 border-border hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-foreground text-base truncate">{gift.gift_name}</h3>
                  <p className="text-muted-foreground text-sm mt-2">
                    💵 <span className="font-bold text-foreground">₹{(gift.total_amount / 100).toFixed(0)}</span>
                  </p>
                  {gift.gift_link && (
                    <a
                      href={gift.gift_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm mt-3 block font-medium"
                    >
                      🔗 View Gift Link
                    </a>
                  )}
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Contributors Section */}
        <Card className="p-6 bg-card border-2 hover:shadow-md transition-shadow overflow-hidden">
          <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
            👥 Contributors ({contributionsByUser?.length || 0})
          </h2>

          {contributionsByUser && contributionsByUser.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 border-b border-border">
                    <tr>
                      <th className="text-left p-3 font-semibold text-foreground">Name</th>
                      <th className="text-left p-3 font-semibold text-foreground">UPI ID</th>
                      <th className="text-left p-3 font-semibold text-foreground">Phone</th>
                      <th className="text-right p-3 font-semibold text-foreground">Amount</th>
                      <th className="text-center p-3 font-semibold text-foreground">Status</th>
                      <th className="text-left p-3 font-semibold text-foreground">Payment Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contributionsByUser.map((contrib: any) => (
                      <tr
                        key={contrib.userId}
                        className={`border-b border-border transition-colors ${contrib.paid ? "bg-green-50/50 dark:bg-green-950/20 hover:bg-green-100/50 dark:hover:bg-green-950/30" : "hover:bg-secondary/50"}`}
                      >
                        <td className="p-3 text-foreground font-medium">{contrib.name}</td>
                        <td className="p-3">
                          <code className="bg-secondary p-1 rounded text-xs text-muted-foreground font-mono">
                            {contrib.upiId || "N/A"}
                          </code>
                        </td>
                        <td className="p-3 text-muted-foreground text-sm">{contrib.phone || "N/A"}</td>
                        <td className="p-3 text-right font-semibold text-foreground">
                          ₹{(contrib.totalAmount / 100).toFixed(0)}
                        </td>
                        <td className="p-3 text-center">
                          {contrib.paid ? (
                            <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold text-xs bg-green-100/50 dark:bg-green-950/50 px-2 py-1 rounded">
                              <CheckCircle size={14} /> Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400 font-semibold text-xs bg-orange-100/50 dark:bg-orange-950/50 px-2 py-1 rounded">
                              <Clock size={14} /> Pending
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-muted-foreground text-sm">
                          {contrib.paymentTime
                            ? new Date(contrib.paymentTime).toLocaleDateString("en-IN")
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {contributionsByUser.map((contrib: any) => (
                  <div
                    key={contrib.userId}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      contrib.paid
                        ? "border-green-200/50 dark:border-green-900/50 bg-green-50/50 dark:bg-green-950/20"
                        : "border-orange-200/50 dark:border-orange-900/50 bg-orange-50/50 dark:bg-orange-950/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{contrib.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {contrib.upiId && `UPI: ${contrib.upiId}`}
                          {contrib.upiId && contrib.phone && " • "}
                          {contrib.phone && `Phone: ${contrib.phone}`}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {contrib.paid ? (
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-semibold bg-green-100/50 dark:bg-green-950/50 px-2 py-1 rounded">
                            <CheckCircle size={12} /> Paid
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 text-xs font-semibold bg-orange-100/50 dark:bg-orange-950/50 px-2 py-1 rounded">
                            <Clock size={12} /> Pending
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-bold text-foreground">₹{(contrib.totalAmount / 100).toFixed(0)}</span>
                    </div>
                    {contrib.paymentTime && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Paid: {new Date(contrib.paymentTime).toLocaleDateString("en-IN")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-center py-8">No contributions yet</p>
          )}
        </Card>
      </div>
    </div>
  );
}
