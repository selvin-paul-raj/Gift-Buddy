"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { adminDeleteEvent, adminUpdateEvent } from "@/lib/actions/admin/events";
import { AdminEventRow } from "@/lib/types/shared.types";
import { Input } from "@/components/ui/input";

type Props = {
  currentUserId: string;
  events: AdminEventRow[];
};

export default function EventsTable({ currentUserId, events: initialEvents }: Props) {
  const [events, setEvents] = useState<AdminEventRow[]>(initialEvents);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSave = async (eventId: string, patch: Partial<AdminEventRow>) => {
    try {
      await adminUpdateEvent(currentUserId, eventId, patch);
      setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, ...patch } : e)));
      toast.success("Event updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update event");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminDeleteEvent(currentUserId, deleteId);
      setEvents((prev) => prev.filter((e) => e.id !== deleteId));
      toast.success("Event deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete event");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className="hidden md:grid md:grid-cols-5 gap-3 border-b border-slate-700 pb-2 font-semibold text-sm text-white">
        <div>Title</div>
        <div>Date</div>
        <div>Status</div>
        <div>Team</div>
        <div className="text-right">Action</div>
      </div>

      <div className="space-y-3">
        {events.map((e) => (
          <div
            key={e.id}
            className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center border border-slate-700 rounded p-3 bg-slate-700"
          >
            <div>
              <span className="md:hidden block text-xs text-gray-400 mb-1">Title</span>
              <Input
                defaultValue={e.title}
                onBlur={(ev) => handleSave(e.id, { title: ev.target.value })}
                className="bg-slate-600 border-slate-500 text-white placeholder-gray-400"
              />
            </div>

            <div>
              <span className="md:hidden block text-xs text-gray-400 mb-1">Date</span>
              <Input
                type="date"
                defaultValue={e.date}
                onBlur={(ev) => handleSave(e.id, { date: ev.target.value })}
                className="bg-slate-600 border-slate-500 text-white"
              />
            </div>

            <div>
              <span className="md:hidden block text-xs text-gray-400 mb-1">Status</span>
              <select
                defaultValue={e.status}
                className="border border-slate-500 bg-slate-600 text-white p-2 rounded w-full md:max-w-[160px]"
                onBlur={(ev) => handleSave(e.id, { status: ev.target.value as any })}
              >
                <option value="planning">planning</option>
                <option value="active">active</option>
                <option value="done">done</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>

            <div className="text-sm text-white">
              <span className="md:hidden block text-xs text-gray-400 mb-1">Team</span>
              {e.teams?.name || "N/A"}
            </div>

            <div className="flex md:justify-end">
              <Button variant="destructive" size="sm" onClick={() => setDeleteId(e.id)} className="bg-red-900 text-red-300 hover:bg-red-800">
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Delete this event?</DialogTitle>
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
