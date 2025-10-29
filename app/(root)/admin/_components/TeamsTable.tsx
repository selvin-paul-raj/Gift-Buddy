"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { adminUpdateTeam, adminDeleteTeam } from "@/lib/actions/admin/teams";
import { AdminTeamRow } from "@/lib/types/shared.types";

type Props = {
  currentUserId: string;
  teams: AdminTeamRow[];
};

export default function TeamsTable({ currentUserId, teams: initialTeams }: Props) {
  const [teams, setTeams] = useState<AdminTeamRow[]>(initialTeams);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSave = async (teamId: string, field: keyof AdminTeamRow, value: string) => {
    try {
      await adminUpdateTeam(currentUserId, teamId, { [field]: value } as any);
      setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, [field]: value } : t)));
      toast.success("Team updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update team");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminDeleteTeam(currentUserId, deleteId);
      setTeams((prev) => prev.filter((t) => t.id !== deleteId));
      toast.success("Team deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete team");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <>
      {/* desktop header */}
      <div className="hidden md:grid md:grid-cols-4 gap-3 border-b border-slate-700 pb-2 font-semibold text-sm text-white">
        <div>Name</div>
        <div>Currency</div>
        <div>Created</div>
        <div className="text-right">Action</div>
      </div>

      <div className="space-y-3">
        {teams.map((t) => (
          <div
            key={t.id}
            className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center border border-slate-700 rounded p-3 bg-slate-700"
          >
            <div>
              <span className="md:hidden block text-xs text-gray-400 mb-1">Name</span>
              <Input
                defaultValue={t.name}
                onBlur={(e) => handleSave(t.id, "name", e.target.value)}
                className="md:max-w-xs bg-slate-600 border-slate-500 text-white placeholder-gray-400"
              />
            </div>

            <div>
              <span className="md:hidden block text-xs text-gray-400 mb-1">Currency</span>
              <select
                defaultValue={t.currency}
                onBlur={(e) => handleSave(t.id, "currency", e.target.value)}
                className="border border-slate-500 bg-slate-600 text-white p-2 rounded w-full md:max-w-[120px]"
              >
                <option value="IDR">IDR</option>
                <option value="USD">USD</option>
              </select>
            </div>

            <div className="text-xs text-gray-400">
              <span className="md:hidden block text-xs text-gray-400 mb-1">Created</span>
              {t.created_at}
            </div>

            <div className="flex md:justify-end">
              <Button variant="destructive" size="sm" onClick={() => setDeleteId(t.id)} className="bg-red-900 text-red-300 hover:bg-red-800">
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Delete this team?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-400">This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteId(null)} className="bg-slate-700 text-gray-300 hover:bg-slate-600">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="bg-red-900 text-red-300 hover:bg-red-800">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
