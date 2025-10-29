"use client";

import { useEventNotification } from "@/lib/hooks/useEventNotification";
import Header from "./Header";
import UpcomingBirthday from "./UpcomingBirthday";

export default function DashboardContent() {
  // Setup event notifications
  useEventNotification();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8 lg:space-y-12">
        <Header />
        <UpcomingBirthday data={[]} />
      </div>
    </div>
  );
}
