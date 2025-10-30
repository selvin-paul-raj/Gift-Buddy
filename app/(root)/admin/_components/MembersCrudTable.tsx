"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AdminUserRow } from "@/lib/queries/admin/users";
import { adminUpdateUser, adminDeleteUser, adminCreateUser } from "@/lib/actions/admin/users";
import { Trash2, Edit2, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface MembersCrudTableProps {
  members: AdminUserRow[];
}

type EditingMember = {
  id: string;
  name: string;
  birthday: string;
} | null;

export default function MembersCrudTable({ members: initialMembers }: MembersCrudTableProps) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers);
  const [editingMember, setEditingMember] = useState<EditingMember>(null);
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberBirthday, setNewMemberBirthday] = useState("");

  const filteredMembers = members.filter(
    (member) =>
      member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (member: AdminUserRow) => {
    setEditingMember({
      id: member.id,
      name: member.name || "",
      birthday: member.birthday || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingMember) return;
    if (!editingMember.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsLoading(true);
    try {
      await adminUpdateUser(editingMember.id, {
        name: editingMember.name,
        birthday: editingMember.birthday || null,
      });

      setMembers(
        members.map((m) =>
          m.id === editingMember.id
            ? { ...m, name: editingMember.name, birthday: editingMember.birthday }
            : m
        )
      );

      toast.success("✅ Member updated");
      setEditingMember(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update member");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteMemberId) return;

    setIsLoading(true);
    try {
      await adminDeleteUser(deleteMemberId);
      setMembers(members.filter((m) => m.id !== deleteMemberId));
      toast.success("✅ Member deleted");
      setDeleteMemberId(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete member");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMember = async () => {
    if (!newMemberName.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsLoading(true);
    try {
      const newMember = await adminCreateUser({
        name: newMemberName,
        birthday: newMemberBirthday || null,
      });

      setMembers([newMember, ...members]);
      toast.success("✅ Member created");
      setIsCreating(false);
      setNewMemberName("");
      setNewMemberBirthday("");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create member");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header with Search and Create Button */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-secondary border-border"
            />
          </div>
          <Button
            onClick={() => setIsCreating(true)}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus size={18} />
            New Member
          </Button>
        </div>

        {/* Members Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary border border-border">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Member</th>
                <th className="px-4 py-3 text-left font-semibold">Birthday</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    No members found
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{member.name || "Unnamed"}</p>
                        <p className="text-xs text-muted-foreground">{member.id}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {member.birthday ? (
                        <Badge variant="outline" className="text-xs">
                          🎂 {new Date(member.birthday).toLocaleDateString("en-IN")}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          onClick={() => handleEdit(member)}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          onClick={() => setDeleteMemberId(member.id)}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <Card className="p-4 bg-secondary/50 border border-border">
          <p className="text-sm font-medium text-foreground">
            Total Members: <span className="text-primary font-bold">{members.length}</span>
          </p>
        </Card>
      </div>

      {/* Create Member Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="bg-card border border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add New Member</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Name *</label>
              <Input
                placeholder="Member name"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="mt-2 bg-background border-border"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Birthday</label>
              <Input
                type="date"
                value={newMemberBirthday}
                onChange={(e) => setNewMemberBirthday(e.target.value)}
                className="mt-2 bg-background border-border"
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsCreating(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleCreateMember} disabled={isLoading} className="bg-primary hover:bg-primary/90">
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={editingMember !== null} onOpenChange={(open) => !open && setEditingMember(null)}>
        <DialogContent className="bg-card border border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Member</DialogTitle>
          </DialogHeader>

          {editingMember && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Name *</label>
                <Input
                  placeholder="Member name"
                  value={editingMember.name}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, name: e.target.value })
                  }
                  className="mt-2 bg-background border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Birthday</label>
                <Input
                  type="date"
                  value={editingMember.birthday}
                  onChange={(e) =>
                    setEditingMember({ ...editingMember, birthday: e.target.value })
                  }
                  className="mt-2 bg-background border-border"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setEditingMember(null)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isLoading} className="bg-primary hover:bg-primary/90">
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteMemberId !== null} onOpenChange={(open) => !open && setDeleteMemberId(null)}>
        <DialogContent className="bg-card border border-border">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Member?</DialogTitle>
          </DialogHeader>

          <p className="text-muted-foreground">
            This will permanently delete the member and all associated data. This action cannot be undone.
          </p>

          <DialogFooter>
            <Button onClick={() => setDeleteMemberId(null)} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
