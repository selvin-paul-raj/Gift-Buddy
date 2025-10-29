"use client";

import { Button } from "@/components/ui/button";
import { markEventAsCompleted } from "@/lib/actions/markPayment";
import { useState } from "react";
import { toast } from "sonner";

export default function MarkEventButton({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const result = await markEventAsCompleted(eventId);
      if (result.success) {
        toast.success("✅ Event marked as completed!");
      } else {
        toast.error(result.error || "Failed to mark event");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to mark event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className="bg-green-500 hover:bg-green-600"
    >
      {loading ? "Processing..." : "✅ Mark as Completed"}
    </Button>
  );
}
