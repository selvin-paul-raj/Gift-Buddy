"use client";

import { useState } from "react";
import { Search, Filter, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Event {
  id: string;
  title: string;
  date: string;
  status: "upcoming" | "completed" | "cancelled";
  birthday_person_id?: string | null;
  created_by: string;
  created_at?: string | null;
  note?: string | null;
}

export default function HistoryList({ data }: { data: Event[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const router = useRouter();

  const filteredEvents = data.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.note && event.note.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === "all" || event.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-900 text-green-300 border-green-700";
      case "cancelled":
        return "bg-red-900 text-red-300 border-red-700";
      case "upcoming":
        return "bg-blue-900 text-blue-300 border-blue-700";
      default:
        return "bg-slate-700 text-gray-300 border-slate-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")} className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Event History 🎉</h1>
          <p className="text-gray-400">Track all your past and upcoming events</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl bg-slate-800 border-slate-700" style={{ boxShadow: "var(--soft-shadow)" }}>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Find by event name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-full bg-slate-700 border-slate-600 text-white placeholder-gray-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-full border border-slate-600 bg-slate-700 text-white"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="upcoming">Upcoming</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl bg-slate-800 border-slate-700" style={{ boxShadow: "var(--soft-shadow)" }}>
        <CardContent className="space-y-4">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-700 hover:bg-slate-600 transition-colors cursor-pointer group"
                onClick={() => router.push(`/dashboard/event/${event.id}`)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center text-2xl">
                    {event.status === "completed"
                      ? "🎉"
                      : event.status === "cancelled"
                      ? "❌"
                      : "⏳"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{event.title}</h3>
                    {event.note && (
                      <p className="text-sm text-gray-400">
                        {event.note}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(event.date).toLocaleDateString("en-IN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <Badge className={`${getStatusColor(event.status)} border`}>
                    {event.status === "completed"
                      ? "Completed"
                      : event.status === "cancelled"
                      ? "Cancelled"
                      : "Upcoming"}
                  </Badge>

                  {event.status === "completed" && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">
                        Tap to view details
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-6xl mb-4">📊</div>
              <p>No events found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
