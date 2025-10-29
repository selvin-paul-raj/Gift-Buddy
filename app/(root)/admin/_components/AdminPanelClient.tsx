"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Users, Calendar, DollarSign } from "lucide-react";
import AdminStats from "./AdminStats";
import UsersTable from "./UsersTable";
import TeamsTable from "./TeamsTable";
import EventsTable from "./EventsTable";
import ContributionsTable from "./ContributionsTable";
import {
  AdminStats as AdminStatsType,
  AdminUserRow,
  AdminTeamRow,
  AdminEventRow,
  AdminContributionRow,
} from "@/lib/types/shared.types";

type Props = {
  currentUserId: string;
  stats: AdminStatsType;
  users: AdminUserRow[];
  teams: AdminTeamRow[];
  events: AdminEventRow[];
  contributions: AdminContributionRow[];
};

export default function AdminPanelClient({
  currentUserId,
  stats,
  users,
  teams,
  events,
  contributions,
}: Props) {
  return (
    <div className="container max-w-7xl mx-auto space-y-6 py-6 bg-black min-h-screen">
      <AdminStats stats={stats} />

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Database className="h-5 w-5" /> Database Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users" className="w-full">
            {/* scrollable on mobile, grid on md+ */}
            <div className="overflow-x-auto">
              <TabsList className="inline-flex w-max md:grid md:w-full md:grid-cols-4 bg-slate-700">
                <TabsTrigger value="users" className="flex items-center gap-2 text-gray-300 data-[state=active]:bg-blue-900 data-[state=active]:text-blue-300">
                  <Users className="h-4 w-4" /> Users
                </TabsTrigger>
                <TabsTrigger value="teams" className="text-gray-300 data-[state=active]:bg-blue-900 data-[state=active]:text-blue-300">Teams</TabsTrigger>
                <TabsTrigger value="events" className="flex items-center gap-2 text-gray-300 data-[state=active]:bg-blue-900 data-[state=active]:text-blue-300">
                  <Calendar className="h-4 w-4" /> Events
                </TabsTrigger>
                <TabsTrigger value="contributions" className="flex items-center gap-2 text-gray-300 data-[state=active]:bg-blue-900 data-[state=active]:text-blue-300">
                  <DollarSign className="h-4 w-4" /> Contributions
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="users" className="mt-6">
              <UsersTable currentUserId={currentUserId} users={users} />
            </TabsContent>

            <TabsContent value="teams" className="mt-6">
              <TeamsTable currentUserId={currentUserId} teams={teams} />
            </TabsContent>

            <TabsContent value="events" className="mt-6">
              <EventsTable currentUserId={currentUserId} events={events} />
            </TabsContent>

            <TabsContent value="contributions" className="mt-6">
              <ContributionsTable
                currentUserId={currentUserId}
                contributions={contributions}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
