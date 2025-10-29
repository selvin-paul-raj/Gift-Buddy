"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AdminContributionRow } from "@/lib/types/shared.types";
import { adminDeleteContribution, adminUpdateContribution } from "@/lib/queries/admin/contributions";
import { Trash2, Check, X } from "lucide-react";

type Props = {
  currentUserId: string;
  contributions: AdminContributionRow[];
};

export default function ContributionsTable({ currentUserId, contributions: initialContributions }: Props) {
  const [contributions, setContributions] = useState<AdminContributionRow[]>(initialContributions);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Separate admin contributions from others
  const { adminContributions, userContributions } = useMemo(() => {
    return {
      adminContributions: contributions.filter((c) => c.user_id === currentUserId),
      userContributions: contributions.filter((c) => c.user_id !== currentUserId),
    };
  }, [contributions, currentUserId]);

  const filteredAll = [...adminContributions, ...userContributions].filter((c) =>
    c.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.events?.date?.includes(searchTerm)
  );

  const handleSave = async (contributionId: string, field: keyof AdminContributionRow, value: string | boolean | number) => {
    try {
      await adminUpdateContribution(currentUserId, contributionId, { [field]: value } as any);
      setContributions((prev) =>
        prev.map((c) => (c.id === contributionId ? { ...c, [field]: value } : c))
      );
      toast.success("Contribution updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update contribution");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminDeleteContribution(currentUserId, deleteId);
      setContributions((prev) => prev.filter((c) => c.id !== deleteId));
      toast.success("Contribution deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete contribution");
    } finally {
      setDeleteId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    const rupees = amount / 100; // Convert from paise to rupees
    return `₹${new Intl.NumberFormat("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(rupees)}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Mobile Card View
  const ContributionCard = ({ c, isAdmin }: { c: AdminContributionRow; isAdmin: boolean }) => (
    <Card className={`border-2 ${isAdmin ? "border-yellow-600 bg-yellow-950/30" : "border-slate-700 bg-slate-800"}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-white text-sm truncate">{c.users?.name || "Unknown"}</p>
              {isAdmin && (
                <Badge className="bg-yellow-700 text-yellow-100 text-xs whitespace-nowrap">Admin</Badge>
              )}
            </div>
            <p className="text-xs text-gray-400">📅 {formatDate(c.events?.date || "")}</p>
            {c.events?.giftNames && (
              <p className="text-xs text-gray-300 mt-1 truncate">{c.events.giftNames}</p>
            )}
          </div>
          <div className="text-right">
            <p className="font-bold text-white text-sm">{formatCurrency(c.split_amount)}</p>
            <p
              className={`text-xs font-semibold ${
                c.paid ? "text-green-400" : "text-red-400"
              }`}
            >
              {c.paid ? "✓ Paid" : "⏱ Pending"}
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="flex-1 min-w-[120px]">
            <label className="text-xs text-gray-400">Amount</label>
            <Input
              type="number"
              defaultValue={c.split_amount / 100}
              onBlur={(e) => handleSave(c.id, "split_amount", Math.round(parseFloat(e.target.value) * 100))}
              step="0.01"
              className="mt-1 bg-slate-700 border-slate-600 text-white text-sm"
            />
          </div>
          <div className="flex gap-2 items-end">
            <Button
              size="sm"
              variant={c.paid ? "default" : "outline"}
              onClick={() => handleSave(c.id, "paid", !c.paid)}
              className={`${
                c.paid
                  ? "bg-green-700 hover:bg-green-800 text-white"
                  : "bg-slate-700 hover:bg-slate-600 text-gray-300"
              } text-xs`}
            >
              {c.paid ? (
                <>
                  <Check className="w-3 h-3 mr-1" /> Paid
                </>
              ) : (
                <>
                  <X className="w-3 h-3 mr-1" /> Mark Paid
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setDeleteId(c.id)}
              className="bg-red-900 text-red-300 hover:bg-red-800 text-xs"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <Input
        placeholder="Search by name or date..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="bg-slate-700 border-slate-600 text-white placeholder-gray-400"
      />

      {/* Mobile View */}
      <div className="block md:hidden space-y-3">
        {/* Admin Section */}
        {adminContributions.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-yellow-300 mb-2">💰 Your Contributions (Admin)</h3>
            <div className="space-y-2">
              {adminContributions
                .filter((c) =>
                  c.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  c.events?.date?.includes(searchTerm)
                )
                .map((c) => (
                  <ContributionCard key={c.id} c={c} isAdmin={true} />
                ))}
            </div>
          </div>
        )}

        {/* Users Section */}
        {userContributions.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-blue-300 mb-2">👥 User Contributions</h3>
            <div className="space-y-2">
              {userContributions
                .filter((c) =>
                  c.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  c.events?.date?.includes(searchTerm)
                )
                .map((c) => (
                  <ContributionCard key={c.id} c={c} isAdmin={false} />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left p-3 text-gray-400 font-semibold">Name</th>
              <th className="text-left p-3 text-gray-400 font-semibold">Event Date</th>
              <th className="text-left p-3 text-gray-400 font-semibold">Gifts</th>
              <th className="text-right p-3 text-gray-400 font-semibold">Amount</th>
              <th className="text-center p-3 text-gray-400 font-semibold">Status</th>
              <th className="text-right p-3 text-gray-400 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Admin contributions first */}
            {adminContributions
              .filter((c) =>
                c.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.events?.date?.includes(searchTerm)
              )
              .map((c, idx) => (
                <tr
                  key={c.id}
                  className="border-b border-yellow-700/50 bg-yellow-900/20 hover:bg-yellow-900/40 transition"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-yellow-300">{c.users?.name || "Unknown"}</span>
                      <Badge className="bg-yellow-700 text-yellow-100 text-xs">Admin</Badge>
                    </div>
                  </td>
                  <td className="p-3 text-gray-300">{formatDate(c.events?.date || "")}</td>
                  <td className="p-3 text-gray-300 max-w-xs truncate">{c.events?.giftNames || "-"}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-300">₹</span>
                      <Input
                        type="number"
                        defaultValue={(c.split_amount / 100).toFixed(2)}
                        onBlur={(e) =>
                          handleSave(c.id, "split_amount", Math.round(parseFloat(e.target.value) * 100))
                        }
                        step="0.01"
                        className="max-w-[100px] bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <Button
                      size="sm"
                      variant={c.paid ? "default" : "outline"}
                      onClick={() => handleSave(c.id, "paid", !c.paid)}
                      className={`${
                        c.paid
                          ? "bg-green-700 hover:bg-green-800 text-white"
                          : "bg-slate-700 hover:bg-slate-600 text-gray-300"
                      }`}
                    >
                      {c.paid ? "✓ Paid" : "Mark Paid"}
                    </Button>
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteId(c.id)}
                      className="bg-red-900 text-red-300 hover:bg-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}

            {/* Regular user contributions */}
            {userContributions
              .filter((c) =>
                c.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.events?.date?.includes(searchTerm)
              )
              .map((c, idx) => (
                <tr
                  key={c.id}
                  className={`border-b border-slate-700 hover:bg-slate-700/50 transition ${
                    idx % 2 === 0 ? "bg-slate-800/50" : ""
                  }`}
                >
                  <td className="p-3 font-medium text-gray-300">{c.users?.name || "Unknown"}</td>
                  <td className="p-3 text-gray-400">{formatDate(c.events?.date || "")}</td>
                  <td className="p-3 text-gray-400 max-w-xs truncate">{c.events?.giftNames || "-"}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-300">₹</span>
                      <Input
                        type="number"
                        defaultValue={(c.split_amount / 100).toFixed(2)}
                        onBlur={(e) =>
                          handleSave(c.id, "split_amount", Math.round(parseFloat(e.target.value) * 100))
                        }
                        step="0.01"
                        className="max-w-[100px] bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <Button
                      size="sm"
                      variant={c.paid ? "default" : "outline"}
                      onClick={() => handleSave(c.id, "paid", !c.paid)}
                      className={`${
                        c.paid
                          ? "bg-green-700 hover:bg-green-800 text-white"
                          : "bg-slate-700 hover:bg-slate-600 text-gray-300"
                      }`}
                    >
                      {c.paid ? "✓ Paid" : "Mark Paid"}
                    </Button>
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteId(c.id)}
                      className="bg-red-900 text-red-300 hover:bg-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {filteredAll.length === 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-8 text-center text-gray-400">
            No contributions found matching your search.
          </CardContent>
        </Card>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Contribution?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-400">This action cannot be undone.</p>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setDeleteId(null)}
              className="bg-slate-700 text-gray-300 hover:bg-slate-600"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-900 text-red-300 hover:bg-red-800"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
