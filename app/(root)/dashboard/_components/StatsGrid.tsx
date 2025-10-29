"use client";

import React from "react";
import { Calendar, Users, Gift, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatsProps } from "@/lib/types/shared.types";

const StatsGrid = ({ stats }: { stats: StatsProps }) => {
  const data = [
    {
      title: "Active Events",
      value: stats.activeEvents,
      icon: Calendar,
      change: stats.activeEventsChange,
    },
    {
      title: "Total Members",
      value: stats.totalMembers,
      icon: Users,
      change: stats.totalMembersChange,
    },
    {
      title: "Collected Fund",
      value: stats.collected,
      icon: Gift,
      change: stats.collectedChange,
    },
    {
      title: "Participation Rate",
      value: stats.participation,
      icon: TrendingUp,
      change: stats.participationChange,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {data.map((stat, index) => (
        <Card
          key={index}
          className="rounded-2xl"
          style={{ boxShadow: "var(--soft-shadow)" }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </div>
              <stat.icon className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsGrid;
