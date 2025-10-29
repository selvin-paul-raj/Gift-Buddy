"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Props = {
  celebrant: string;
  teamName: string;
  date: string;
  daysLeft: number;
  note?: string | null;
};

export default function EventInfoCard({ celebrant, teamName, date, daysLeft, note }: Props) {
  return (
    <Card className="rounded-2xl bg-slate-800 border-slate-700" style={{ boxShadow: "var(--soft-shadow)" }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl text-white">🎂 {celebrant}</CardTitle>
            <CardDescription className="text-gray-400">
              Tim {teamName} •{" "}
              {new Date(date).toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
            {note && <p className="text-sm mt-2 text-gray-400">{note}</p>}
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2 bg-blue-900 text-blue-300 border-blue-700">
            in {daysLeft} days
          </Badge>
        </div>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
}
