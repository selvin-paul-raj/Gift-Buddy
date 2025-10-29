"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import UserEventCard from "./UserEventCard";
import { createClient } from "@/lib/supabase/client";
import type { EventData } from "@/lib/types/shared.types";

export default function UpcomingBirthday({ data }: { data: any[] }) {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        const supabase = createClient();

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        // Get current user's UPI and phone from profile
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("upi_id, phone")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Failed to fetch user profile:", profileError);
        }

        const { data: upcomingEventsData, error: eventsError } = await supabase
          .from("events")
          .select(`
            id,
            title,
            date,
            birthday_person_id,
            upi_id,
            phone,
            gifts(
              id,
              gift_name,
              gift_link,
              total_amount
            ),
            users!events_birthday_person_id_fkey(name)
          `)
          .eq("status", "upcoming")
          .neq("birthday_person_id", user.id)
          .order("date", { ascending: true });

        if (eventsError) {
          console.error("Events fetch error:", eventsError);
          setLoading(false);
          return;
        }

        if (!upcomingEventsData) {
          setLoading(false);
          return;
        }

        // Get user contributions for each event
        const eventDataPromises = upcomingEventsData.map(async (event: any) => {
          const { data: contributions } = await supabase
            .from("contributions")
            .select("split_amount, paid, payment_time")
            .eq("event_id", event.id)
            .eq("user_id", user.id)
            .single(); // Now there's only ONE contribution per user per event

          if (!contributions) {
            return null;
          }

          // Calculate total gift amount and format gifts with links
          const totalGiftAmount = (event.gifts || []).reduce((sum: number, gift: any) => sum + gift.total_amount / 100, 0);
          const gifts = (event.gifts || []).map((gift: any) => ({
            name: gift.gift_name,
            link: gift.gift_link || null,
            amount: gift.total_amount / 100, // Convert from paise to rupees
          }));

          return {
            eventId: event.id,
            eventTitle: event.title,
            eventDate: event.date,
            birthdayPersonName: event.users?.name || "Unknown",
            totalGiftAmount,
            gifts,
            userUPI: event.upi_id || null,
            userPhone: event.phone || null,
            userSplitAmount: contributions.split_amount / 100, // User's total share
            paid: contributions.paid,
            paymentTime: contributions.payment_time,
          } as EventData;
        });

        const eventResults = await Promise.all(eventDataPromises);
        setEvents(eventResults.filter((e): e is EventData => e !== null));
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserEvents();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border-2 border-border overflow-hidden bg-card animate-pulse">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="h-6 bg-muted rounded-md mb-2 w-3/4" />
                    <div className="h-4 bg-muted rounded-md w-1/2" />
                  </div>
                  <div className="h-6 bg-muted rounded-md w-16 flex-shrink-0" />
                </div>
                <div className="h-10 bg-muted rounded-md" />
                <div className="h-px bg-border" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded-md" />
                  <div className="h-8 bg-muted rounded-md" />
                  <div className="h-8 bg-muted rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="text-6xl mb-4">🎂</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No upcoming celebrations yet</h3>
        <p className="text-muted-foreground">Celebrate with your team when the next birthday comes around!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {events.map((event) => (
        <UserEventCard key={event.eventId} event={event} />
      ))}
    </div>
  );
}
