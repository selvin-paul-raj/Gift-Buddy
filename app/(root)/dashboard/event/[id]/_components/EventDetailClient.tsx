"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Ban } from "lucide-react";
import EventInfoCard from "./EventInfoCard";
import PaymentStatusCard from "./PaymentStatusCard";
import FoodPollCard from "./FoodPollCard";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EventDetailProps } from "@/lib/types/shared.types";

export default function EventDetailClient({
  event,
  contributions,
  food,
  currentUserId,
}: EventDetailProps) {
  const router = useRouter();
  const supabase = createClient();

  const [participants, setParticipants] = useState(contributions);
  const [foodPoll, setFoodPoll] = useState(food);

  const userVote = useMemo(() => {
    const found = foodPoll
      .flatMap((f) => f.votes.map((v) => ({ foodId: f.id, ...v })))
      .find((v) => v.user_id === currentUserId);
    return found?.foodId ?? null;
  }, [foodPoll, currentUserId]);

  const daysLeft = useMemo(() => {
    const d = Math.ceil(
      (new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return d;
  }, [event.date]);

  const totalTarget = useMemo(
    () => participants.reduce((sum, p) => sum + Number(p.amount ?? 0), 0),
    [participants]
  );
  const collectedAmount = useMemo(
    () => participants.filter((p) => p.paid).reduce((sum, p) => sum + Number(p.amount ?? 0), 0),
    [participants]
  );
  const paidCount = useMemo(() => participants.filter((p) => p.paid).length, [participants]);

  async function togglePaymentStatus(userId: string) {
    if (event.status === "cancelled" || event.status === "done") return;
    const current = participants.find((p) => p.user_id === userId);
    if (!current) return;
    const nextPaid = !current.paid;

    setParticipants((prev) =>
      prev.map((p) => (p.user_id === userId ? { ...p, paid: nextPaid } : p))
    );

    await supabase
      .from("contributions")
      .update({ paid: nextPaid })
      .match({ event_id: event.id, user_id: userId });
  }

  async function handleVote(foodId: string) {
    // Food voting feature disabled in current version
    // if (event.status === "cancelled" || event.status === "done") return;
    // ... rest of implementation omitted
  }

  async function handleCancelEvent() {
    const { error } = await supabase
      .from("events")
      .update({ status: "cancelled" })
      .eq("id", event.id);

    if (error) {
      console.error("Failed to cancel event:", error);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-black p-4 space-y-6">

      {event.status === "cancelled" && (
        <div className="p-4 rounded-lg bg-red-950 text-red-300 text-sm text-center border border-red-800">
          This event has been cancelled. No further actions are allowed.
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")} className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Birthday Event 🎉</h1>
            <p className="text-gray-400">Detail for split bill and food votes</p>
          </div>
        </div>

        {event.status !== "cancelled" && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-red-900 text-red-400 hover:bg-red-950 bg-slate-800">
                <Ban className="h-4 w-4" />
                Cancel Event
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Cancel Event</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Are you sure you want to cancel the event for <strong className="text-gray-300">{event.birthdayPerson?.name}</strong>?
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" className="border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600">No</Button>
                <Button variant="destructive" onClick={handleCancelEvent} className="bg-red-900 hover:bg-red-800 text-red-300">
                  Yes, cancel it
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <EventInfoCard
        celebrant={event.birthdayPerson?.name ?? "Unknown"}
        teamName={event.team?.name ?? "Unknown"}
        date={event.date}
        daysLeft={daysLeft}
        note={event.note}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PaymentStatusCard
          participants={participants}
          paidCount={paidCount}
          totalAmount={totalTarget}
          collectedAmount={collectedAmount}
          currency={event.team?.currency || "IDR"} // New
          onTogglePaid={togglePaymentStatus}
          eventId={event.id}
          disabled={event.status === "cancelled" || event.status === "done"}
        />
        <FoodPollCard
          foodPoll={foodPoll}
          userVote={userVote}
          totalVoters={participants.length}
          onVote={handleVote}
          disabled={event.status === "cancelled" || event.status === "done"}
        />
      </div>
    </div>
  );
}
