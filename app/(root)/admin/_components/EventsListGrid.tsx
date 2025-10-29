"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { ArrowRight, Calendar, Gift, Users, Zap } from "lucide-react";

interface EventWithStats {
  id: string;
  title: string;
  date: string;
  status: "upcoming" | "completed" | "cancelled";
  note?: string | null;
  total_contributions: number;
  total_collected: number;
  total_pending: number;
  gifts_count: number;
}

interface EventsListGridProps {
  events: EventWithStats[];
  isLoading?: boolean;
}

export default function EventsListGrid({ events, isLoading }: EventsListGridProps) {
  const router = useRouter();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "upcoming":
        return {
          badge: "bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-900",
          text: "Upcoming",
        };
      case "completed":
        return {
          badge: "bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-900",
          text: "Completed",
        };
      case "cancelled":
        return {
          badge: "bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-900",
          text: "Cancelled",
        };
      default:
        return {
          badge: "bg-gray-100 dark:bg-gray-950/40 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-900",
          text: status,
        };
    }
  };

  const calculateCollectionPercentage = (collected: number, pending: number) => {
    const total = collected + pending;
    return total > 0 ? Math.round((collected / total) * 100) : 0;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 animate-slideInUp">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="rounded-lg border-2 border-border animate-pulse h-64 md:h-80 bg-secondary" />
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Card className="rounded-lg border-2 border-border col-span-full animate-fadeIn">
        <CardContent className="p-8 md:p-12 text-center">
          <div className="text-5xl md:text-6xl mb-3 md:mb-4">🎉</div>
          <p className="text-foreground font-semibold mb-1 md:mb-2 text-base md:text-lg">No events yet</p>
          <p className="text-xs md:text-sm text-muted-foreground">Create your first birthday event to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
      {events.map((event) => {
        const collectionPercentage = calculateCollectionPercentage(
          event.total_collected,
          event.total_pending
        );
        const statusConfig = getStatusConfig(event.status);
        const eventDate = new Date(event.date);
        const today = new Date();
        const daysUntil = Math.ceil(
          (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        const getDaysColor = () => {
          if (daysUntil <= 0) return "text-red-600 dark:text-red-400";
          if (daysUntil <= 3) return "text-orange-600 dark:text-orange-400";
          if (daysUntil <= 7) return "text-yellow-600 dark:text-yellow-400";
          return "text-green-600 dark:text-green-400";
        };

        return (
          <Card
            key={event.id}
            className="border-2 border-border rounded-lg hover:shadow-md transition-all duration-200 hover:border-primary cursor-pointer group overflow-hidden animate-fadeIn active:scale-98"
            onClick={() => router.push(`/admin/event/${event.id}`)}
          >
            <CardContent className="p-3 md:p-6">
              {/* Header - Compact on Mobile */}
              <div className="flex items-start justify-between gap-2 md:gap-3 mb-2 md:mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm md:text-lg font-semibold text-foreground truncate">{event.title}</h3>
                  {event.note && (
                    <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1 line-clamp-1 md:line-clamp-2">{event.note}</p>
                  )}
                </div>
                <Badge className={`text-xs md:text-sm whitespace-nowrap flex-shrink-0 ${statusConfig.badge}`}>
                  {statusConfig.text}
                </Badge>
              </div>

              {/* Date & Days - Compact Mobile */}
              <div className="flex items-center justify-between gap-1 md:gap-2 mb-2 md:mb-4 text-xs md:text-sm">
                <div className="flex items-center gap-1 md:gap-2 text-muted-foreground truncate">
                  <Calendar size={14} className="md:w-4 md:h-4 flex-shrink-0" />
                  <span className="truncate">
                    {eventDate.toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: event.status === "upcoming" ? undefined : "numeric",
                    })}
                  </span>
                </div>
                {event.status === "upcoming" && (
                  <span className={`font-semibold whitespace-nowrap flex-shrink-0 ${getDaysColor()}`}>
                    {daysUntil === 0 ? "Today" : daysUntil < 0 ? "Overdue" : `${daysUntil}d`}
                  </span>
                )}
              </div>

              {/* Divider - Thinner on Mobile */}
              <div className="h-px bg-border mb-2 md:mb-4" />

              {/* Stats Grid - Compact Mobile */}
              <div className="grid grid-cols-2 gap-2 md:gap-3 mb-2 md:mb-4">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <div className="w-8 md:w-10 h-8 md:h-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center flex-shrink-0">
                    <Gift size={16} className="md:w-4.5 md:h-4.5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{event.gifts_count === 1 ? 'Gift' : 'Gifts'}</p>
                    <p className="text-base md:text-lg font-bold text-foreground">{event.gifts_count}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <div className="w-8 md:w-10 h-8 md:h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center flex-shrink-0">
                    <Users size={16} className="md:w-4.5 md:h-4.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Contributors</p>
                    <p className="text-base md:text-lg font-bold text-foreground">{event.total_contributions}</p>
                  </div>
                </div>
              </div>

              {/* Collection Progress - Compact */}
              <div className="mb-2 md:mb-4">
                <div className="flex justify-between items-center mb-1 md:mb-2">
                  <span className="text-xs md:text-sm font-medium text-foreground">Collection</span>
                  <span className="text-xs md:text-sm font-bold text-green-600 dark:text-green-400">{collectionPercentage}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5 md:h-2 overflow-hidden">
                  <div
                    className="bg-green-500 h-full rounded-full transition-all"
                    style={{ width: `${collectionPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 md:mt-2 text-xs text-muted-foreground">
                  <span>₹{(event.total_collected / 100).toLocaleString("en-IN")}</span>
                  <span className="text-right">₹{(event.total_pending / 100).toLocaleString("en-IN")} pending</span>
                </div>
              </div>

              {/* Action Button - Compact Mobile */}
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-all text-xs md:text-sm h-8 md:h-10 group-hover:translate-x-0.5"
                size="sm"
              >
                View Details
                <ArrowRight size={14} className="md:w-4 md:h-4 ml-1 md:ml-2" />
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
