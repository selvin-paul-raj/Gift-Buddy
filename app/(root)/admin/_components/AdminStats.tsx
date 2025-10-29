"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar, DollarSign, UserSquare2 } from "lucide-react";

type Props = {
  stats: {
    totalUsers: number;
    activeTeams: number;
    activeEvents: number;
    totalContributions: number;
  };
};

const tiles = [
  { key: "totalUsers", label: "Total Users", icon: UserSquare2 },
  { key: "activeTeams", label: "Active Teams", icon: Users },
  { key: "activeEvents", label: "Active Events", icon: Calendar },
  { key: "totalContributions", label: "Total Contributions", icon: DollarSign },
] as const;

export default function AdminStats({ stats }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {tiles.map((t) => {
        const Icon = t.icon;
        const value =
          t.key === "totalContributions"
            ? `Rp ${stats.totalContributions.toLocaleString("id-ID")}`
            : stats[t.key];
        return (
          <Card key={t.key} className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 flex items-center gap-3">
              <Icon className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">{t.label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
