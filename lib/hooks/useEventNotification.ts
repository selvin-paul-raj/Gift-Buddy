import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function useEventNotification() {
  useEffect(() => {
    const supabase = createClient();
    let subscription: any;

    const setupNotification = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Subscribe to new events created by other users
      subscription = supabase
        .channel("new_events")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "events",
            filter: `birthday_person_id=neq.${user.id}`,
          },
          (payload: any) => {
            const newEvent = payload.new;
            toast.success(`🎁 New celebration: "${newEvent.title}" has been created!`, {
              description: `Birthday: ${new Date(newEvent.date).toLocaleDateString()}`,
              duration: 5000,
            });

            // Request browser notification permission if available
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("🎁 GiftBuddy", {
                body: `New celebration: "${newEvent.title}" has been created!`,
                icon: "/gift.png",
                badge: "/gift.svg",
              });
            }
          }
        )
        .subscribe();
    };

    setupNotification();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);
}
