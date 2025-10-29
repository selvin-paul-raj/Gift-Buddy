"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Calendar, DollarSign, Clock, CheckCircle2, TrendingUp } from "lucide-react";

interface AdminStats {
  totalEvents: number;
  completedEvents: number;
  upcomingEvents: number;
  totalCollected: number;
  totalPending: number;
  totalContributions: number;
  paidContributions: number;
}

interface AdminSummaryCardsProps {
  stats: AdminStats;
}

export default function AdminSummaryCards({ stats }: AdminSummaryCardsProps) {
  const collectionPercentage =
    stats.totalContributions > 0
      ? Math.round((stats.paidContributions / stats.totalContributions) * 100)
      : 0;

  const cards = [
    {
      title: "Total Events",
      value: stats.totalEvents,
      subtitle: `${stats.completedEvents} completed`,
      icon: Calendar,
      borderColor: "border-blue-200 dark:border-blue-900",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Total Collected",
      value: `₹${stats.totalCollected.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`,
      subtitle: `${collectionPercentage}% collected`,
      icon: DollarSign,
      borderColor: "border-green-200 dark:border-green-900",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      iconColor: "text-green-600 dark:text-green-400",
      highlight: true,
    },
    {
      title: "Pending Payments",
      value: `₹${stats.totalPending.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`,
      subtitle: `${stats.totalContributions - stats.paidContributions} pending`,
      icon: Clock,
      borderColor: "border-orange-200 dark:border-orange-900",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Completed Events",
      value: stats.completedEvents,
      subtitle: `${((stats.completedEvents / (stats.totalEvents || 1)) * 100).toFixed(0)}% complete`,
      icon: CheckCircle2,
      borderColor: "border-green-200 dark:border-green-900",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      iconColor: "text-green-600 dark:text-green-400",
    },
  ];

  return (
    <div className="mb-8">
      {/* Mobile: Compact Dropdown Cards */}
      <div className="block md:hidden space-y-2 animate-fadeIn">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card
              key={index}
              className={`border-2 rounded-lg transition-all duration-200 hover:shadow-sm active:scale-98 ${card.borderColor} ${card.bgColor}`}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`${card.iconColor} flex-shrink-0`}>
                      <Icon size={20} strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">{card.title}</p>
                      <p className="text-lg sm:text-xl font-bold text-foreground truncate">{card.value}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                  </div>
                </div>
                {card.highlight && (
                  <div className="mt-2 flex items-center gap-1 text-xs font-medium animate-pulse">
                    <TrendingUp size={12} className="text-green-600 dark:text-green-400" />
                    <span className="text-green-600 dark:text-green-400">Active</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Desktop: Full Size Cards */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card
              key={index}
              className={`border-2 rounded-lg transition-all duration-300 hover:shadow-md hover:scale-105 ${card.borderColor} ${card.bgColor}`}
            >
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-2">{card.title}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">{card.value}</p>
                    <p className="text-xs text-muted-foreground mt-2">{card.subtitle}</p>
                  </div>
                  <div className={`${card.iconColor}`}>
                    <Icon size={28} strokeWidth={1.5} />
                  </div>
                </div>
                {card.highlight && (
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-medium animate-pulse">
                    <TrendingUp size={14} className="text-green-600 dark:text-green-400" />
                    <span className="text-green-600 dark:text-green-400">Payment tracking active</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
