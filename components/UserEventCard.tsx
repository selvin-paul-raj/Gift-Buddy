"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Contribution } from "@/lib/types/database.types";
import { markContributionAsPaid } from "@/lib/actions/markPayment";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Check, X } from "lucide-react";

interface Gift {
  id: string;
  gift_name: string;
  gift_link?: string | null;
  total_amount: number;
}

interface UserEventCardProps {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  gifts: Gift[];
  contributions: Contribution[];
}

export default function UserEventCard({
  eventId,
  eventTitle,
  eventDate,
  gifts,
  contributions,
}: UserEventCardProps) {
  const router = useRouter();
  const [isMarking, setIsMarking] = useState(false);

  const totalAmount = contributions.reduce((sum, c) => sum + c.split_amount, 0);
  const isPaid = contributions.every((c) => c.paid);
  const contribution = contributions[0]; // Get first contribution

  const handleMarkPaid = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!contribution) return;

    setIsMarking(true);
    try {
      const result = await markContributionAsPaid(contribution.id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to mark payment");
      }
    } catch (error) {
      console.error("Error marking payment:", error);
      toast.error("Something went wrong");
    } finally {
      setIsMarking(false);
    }
  };

  const eventDateObj = new Date(eventDate);
  const formattedDate = eventDateObj.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Get primary gift (first one)
  const primaryGift = gifts[0];

  return (
    <Card className="rounded-2xl hover:shadow-lg transition-all border-l-4 border-l-blue-500 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{eventTitle}</h3>
            <p className="text-sm text-gray-500 mt-1">📅 {formattedDate}</p>
          </div>
          <Badge variant={isPaid ? "default" : "secondary"}>
            {isPaid ? "✅ Paid" : "⏳ Pending"}
          </Badge>
        </div>

        {/* Gift Info */}
        {primaryGift && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <p className="text-xs text-gray-600 mb-1">Gift:</p>
            <p className="font-semibold text-gray-900">{primaryGift.gift_name}</p>
            {primaryGift.gift_link && (
              <a
                href={primaryGift.gift_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline mt-1"
              >
                🔗 View link
              </a>
            )}
          </div>
        )}

        {/* Amount */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Your amount</span>
            <span className="text-2xl font-bold text-green-600">
              ₹{(totalAmount / 100).toFixed(0)}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {contributions.length} contributor{contributions.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Action Button */}
        {!isPaid ? (
          <Button
            onClick={handleMarkPaid}
            disabled={isMarking}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium"
          >
            {isMarking ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Marking...
              </>
            ) : (
              <>
                <Check size={16} className="mr-2" />
                Mark as Paid
              </>
            )}
          </Button>
        ) : (
          <Button disabled className="w-full bg-green-100 text-green-800 rounded-lg font-medium">
            <Check size={16} className="mr-2" />
            Paid on {contribution.created_at ? new Date(contribution.created_at).toLocaleDateString("en-IN") : "Recently"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
