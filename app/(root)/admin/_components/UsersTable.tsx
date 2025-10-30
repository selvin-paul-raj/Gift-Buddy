"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { adminUpdateUser, adminDeleteUser } from "@/lib/actions/admin/users";
import { AdminUserRow } from "@/lib/queries/admin/users";

type Props = {
  currentUserId: string;
  users: AdminUserRow[];
};

export default function UsersTable({ currentUserId, users: initialUsers }: Props) {
  const [users, setUsers] = useState<AdminUserRow[]>(initialUsers);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSave = async (userId: string, field: keyof AdminUserRow, value: string) => {
    try {
      await adminUpdateUser(userId, { [field]: value });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, [field]: value } : u)));
      toast.success("User updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminDeleteUser(deleteId);
      setUsers((prev) => prev.filter((u) => u.id !== deleteId));
      toast.success("User deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="overflow-x-auto space-y-3">
      {users.map((u) => (
        <div
          key={u.id}
          className="flex flex-col md:flex-row gap-2 md:items-center border border-slate-700 rounded p-3 bg-slate-700"
        >
          <div className="flex-1 flex flex-col gap-2 md:flex-row md:gap-3">
            <Input
              defaultValue={u.name ?? ""}
              onBlur={(e) => handleSave(u.id, "name", e.target.value)}
              className="md:max-w-xs bg-slate-600 border-slate-500 text-white placeholder-gray-400"
            />
            <Input
              type="date"
              defaultValue={u.birthday ?? ""}
              onBlur={(e) => handleSave(u.id, "birthday", e.target.value)}
              className="md:max-w-[200px] bg-slate-600 border-slate-500 text-white"
            />
            <div className="text-xs text-gray-400 md:ml-auto break-all">
              {u.email ?? ""}
            </div>
          </div>
          <div className="flex justify-end mt-2 md:mt-0">
            <Button variant="destructive" size="sm" onClick={() => setDeleteId(u.id)} className="bg-red-900 text-red-300 hover:bg-red-800">
              Delete
            </Button>
          </div>
        </div>
      ))}

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Delete this user?</DialogTitle>
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
    </div>
  );
}
