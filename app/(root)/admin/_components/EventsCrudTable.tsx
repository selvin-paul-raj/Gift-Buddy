"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { adminDeleteEvent, adminUpdateEvent, adminCloneEvent } from "@/lib/actions/admin/events";
import { adminUpdateEvent as updateEventAction } from "@/lib/actions/admin/events";
import { AdminEventRow, EventStatus } from "@/lib/types/shared.types";
import { Trash2, Edit2, Copy, Eye, Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface EventsCrudTableProps {
  events: AdminEventRow[];
  currentUserId: string;
}

type EditingEvent = {
  id: string;
  title: string;
  date: string;
  status: string;
  note?: string;
} | null;

export default function EventsCrudTable({ events: initialEvents, currentUserId }: EventsCrudTableProps) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);
  const [editingEvent, setEditingEvent] = useState<EditingEvent>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [cloneId, setCloneId] = useState<string | null>(null);
  const [cloneDate, setCloneDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEvents = events.filter(
    (event) =>
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.birthday_person?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (event: AdminEventRow) => {
    setEditingEvent({
      id: event.id,
      title: event.title || "",
      date: event.date || "",
      status: event.status as EventStatus,
      note: event.note || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingEvent) return;
    setIsLoading(true);
    try {
      await updateEventAction(currentUserId, editingEvent.id, {
        title: editingEvent.title,
        date: editingEvent.date,
        status: editingEvent.status as EventStatus,
        note: editingEvent.note,
      });
      setEvents((prev) =>
        prev.map((e) =>
          e.id === editingEvent.id
            ? {
                ...e,
                title: editingEvent.title,
                date: editingEvent.date,
                status: editingEvent.status as EventStatus,
                note: editingEvent.note || null,
              }
            : e
        )
      );
      toast.success("Event updated successfully!");
      setEditingEvent(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update event");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsLoading(true);
    try {
      await adminDeleteEvent(currentUserId, deleteId);
      setEvents((prev) => prev.filter((e) => e.id !== deleteId));
      toast.success("Event deleted successfully!");
      setDeleteId(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete event");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClone = async () => {
    if (!cloneId || !cloneDate) return;
    setIsLoading(true);
    try {
      const clonedEvent = await adminCloneEvent(currentUserId, cloneId, cloneDate);
      setEvents((prev) => [clonedEvent as unknown as AdminEventRow, ...prev]);
      toast.success("Event cloned successfully!");
      setCloneId(null);
      setCloneDate("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to clone event");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-900";
      case "completed":
        return "bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-900";
      case "cancelled":
        return "bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-900";
      default:
        return "bg-gray-100 dark:bg-gray-950/40 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-900";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search by event title, person name, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-secondary border-border text-foreground placeholder-muted-foreground"
        />
      </div>

      {/* Mobile View - Compact Dropdown Style Cards */}
      <div className="block md:hidden space-y-2 animate-fadeIn">
        {filteredEvents.map((event) => (
          <Card 
            key={event.id} 
            className="border-2 border-border rounded-lg transition-all duration-200 hover:shadow-sm active:scale-98 bg-white dark:bg-slate-950"
          >
            <CardContent className="p-3">
              {/* Header - Title and Status */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm truncate leading-tight">{event.title}</h3>
                  <p className="text-xs text-muted-foreground truncate">{event.birthday_person?.name || "N/A"}</p>
                </div>
                <Badge className={`text-xs whitespace-nowrap flex-shrink-0 ${getStatusConfig(event.status as EventStatus)}`}>
                  {event.status}
                </Badge>
              </div>

              {/* Date & Note in Collapsible Style */}
              <div className="space-y-1.5 mb-2.5 text-xs">
                <div className="text-muted-foreground flex items-center gap-1">
                  <span>📅</span>
                  <span>{formatDate(event.date)}</span>
                </div>
                {event.note && (
                  <div className="text-muted-foreground bg-secondary p-2 rounded border border-border line-clamp-2">
                    {event.note}
                  </div>
                )}
              </div>

              {/* Action Buttons - Compact */}
              <div className="flex gap-1.5 flex-wrap">
                <Button
                  size="sm"
                  onClick={() => router.push(`/admin/event/${event.id}`)}
                  className="flex-1 min-w-fit h-8 bg-blue-600 text-blue-50 hover:bg-blue-700 text-xs px-2 transition-smooth"
                >
                  <Eye className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleEdit(event)}
                  className="flex-1 min-w-fit h-8 bg-amber-600 text-amber-50 hover:bg-amber-700 text-xs px-2 transition-smooth"
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => setCloneId(event.id)}
                  className="flex-1 min-w-fit h-8 bg-purple-600 text-purple-50 hover:bg-purple-700 text-xs px-2 transition-smooth"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => setDeleteId(event.id)}
                  className="flex-1 min-w-fit h-8 bg-red-600 text-red-50 hover:bg-red-700 text-xs px-2 transition-smooth"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary">
              <th className="text-left p-4 text-foreground font-semibold">Event Title</th>
              <th className="text-left p-4 text-foreground font-semibold">Person</th>
              <th className="text-left p-4 text-foreground font-semibold">Date</th>
              <th className="text-left p-4 text-foreground font-semibold">Status</th>
              <th className="text-left p-4 text-foreground font-semibold">Note</th>
              <th className="text-right p-4 text-foreground font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event, idx) => (
              <tr
                key={event.id}
                className={`border-b border-border transition-colors ${
                  idx % 2 === 0 ? "bg-card" : "bg-background"
                } hover:bg-secondary`}
              >
                <td className="p-4">
                  <div>
                    <p className="font-medium text-foreground">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.id.substring(0, 8)}...</p>
                  </div>
                </td>
                <td className="p-4 text-foreground">{event.birthday_person?.name || "N/A"}</td>
                <td className="p-4 text-foreground">{formatDate(event.date)}</td>
                <td className="p-4">
                  <Badge className={getStatusConfig(event.status as EventStatus)}>
                    {event.status}
                  </Badge>
                </td>
                <td className="p-4 text-muted-foreground max-w-xs truncate">{event.note || "-"}</td>
                <td className="p-4">
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      onClick={() => router.push(`/admin/event/${event.id}`)}
                      className="bg-blue-600 dark:bg-blue-900 text-blue-50 dark:text-blue-200 hover:bg-blue-700 dark:hover:bg-blue-800"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleEdit(event)}
                      className="bg-amber-600 dark:bg-amber-900 text-amber-50 dark:text-amber-200 hover:bg-amber-700 dark:hover:bg-amber-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setCloneId(event.id)}
                      className="bg-purple-600 dark:bg-purple-900 text-purple-50 dark:text-purple-200 hover:bg-purple-700 dark:hover:bg-purple-800"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setDeleteId(event.id)}
                      className="bg-red-600 dark:bg-red-900 text-red-50 dark:text-red-200 hover:bg-red-700 dark:hover:bg-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredEvents.length === 0 && (
        <Card className="border-2 border-border rounded-lg">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No events found matching your search.</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingEvent} onOpenChange={() => setEditingEvent(null)}>
        <DialogContent className="bg-card border border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Event</DialogTitle>
          </DialogHeader>
          {editingEvent && (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm text-foreground font-semibold">Title</label>
                <Input
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  className="mt-2 bg-secondary border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-foreground font-semibold">Date</label>
                <Input
                  type="date"
                  value={editingEvent.date}
                  onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                  className="mt-2 bg-secondary border-border text-foreground"
                />
              </div>
              <div>
                <label className="text-sm text-foreground font-semibold">Status</label>
                <select
                  value={editingEvent.status}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, status: e.target.value })
                  }
                  className="w-full mt-2 bg-secondary border border-border text-foreground rounded px-3 py-2"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-foreground font-semibold">Note</label>
                <textarea
                  value={editingEvent.note || ""}
                  onChange={(e) => setEditingEvent({ ...editingEvent, note: e.target.value })}
                  placeholder="Event notes (optional)"
                  className="w-full mt-2 bg-secondary border border-border text-foreground rounded px-3 py-2 text-sm"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setEditingEvent(null)}
              className="bg-secondary text-foreground hover:bg-border"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-card border border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete Event?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will delete the event and all associated contributions, gifts, and data. This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setDeleteId(null)}
              className="bg-secondary text-foreground hover:bg-border"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 dark:bg-red-900 text-red-50 dark:text-red-200 hover:bg-red-700 dark:hover:bg-red-800"
            >
              {isLoading ? "Deleting..." : "Delete Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clone Dialog */}
      <Dialog open={!!cloneId} onOpenChange={() => setCloneId(null)}>
        <DialogContent className="bg-card border border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Clone Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Select a new date for the cloned event. All gifts and details will be copied.
            </p>
            <div>
              <label className="text-sm text-foreground font-semibold">New Date</label>
              <Input
                type="date"
                value={cloneDate}
                onChange={(e) => setCloneDate(e.target.value)}
                className="mt-2 bg-secondary border-border text-foreground"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setCloneId(null)}
              className="bg-secondary text-foreground hover:bg-border"
            >
              Cancel
            </Button>
            <Button
              onClick={handleClone}
              disabled={isLoading || !cloneDate}
              className="bg-purple-600 dark:bg-purple-900 text-purple-50 dark:text-purple-200 hover:bg-purple-700 dark:hover:bg-purple-800"
            >
              {isLoading ? "Cloning..." : "Clone Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
