"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { User } from "@/lib/types/database.types";
import { createEventWithGifts } from "@/lib/actions/createEventWithGifts";
import { Trash2, Plus, Copy, Check } from "lucide-react";

interface AdminCreateEventFormProps {
  users: User[];
}

interface Gift {
  id: string;
  name: string;
  link: string;
  estimatedCost: string;
}

export default function AdminCreateEventForm({ users }: AdminCreateEventFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [birthdayPersonId, setBirthdayPersonId] = useState("");
  const [gifts, setGifts] = useState<Gift[]>([{ id: "1", name: "", link: "", estimatedCost: "" }]);
  const [excludedUserIds, setExcludedUserIds] = useState<string[]>([]);
  const [upiId, setUpiId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const addGift = () => {
    setGifts([...gifts, { id: Date.now().toString(), name: "", link: "", estimatedCost: "" }]);
  };

  const removeGift = (id: string) => {
    if (gifts.length > 1) {
      setGifts(gifts.filter((g) => g.id !== id));
    } else {
      toast.error("At least one gift required");
    }
  };

  const updateGift = (id: string, field: keyof Gift, value: string) => {
    setGifts(gifts.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
  };

  const toggleUserExclusion = (userId: string) => {
    setExcludedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const isStep1Valid = eventTitle.trim() && eventDate && birthdayPersonId;
  const isStep2Valid = true; // Exclusions step is always valid (can have none)
  const isStep3Valid = gifts.every((g) => g.name.trim() && g.estimatedCost && parseFloat(g.estimatedCost) > 0);

  const totalGiftCost = gifts.reduce((sum, g) => sum + (parseFloat(g.estimatedCost) || 0), 0);

  // Calculate split amount based on included users
  const includedUsers = users.filter(
    (u) => u.id !== birthdayPersonId && !excludedUserIds.includes(u.id)
  );
  const splitAmountPerPerson = includedUsers.length > 0 ? totalGiftCost / includedUsers.length : 0;

  const handleSubmit = async () => {
    if (!isStep1Valid || !isStep2Valid || !isStep3Valid) {
      toast.error("Please complete all fields");
      return;
    }

    if (includedUsers.length <= 0) {
      toast.error("At least one user must participate in cost splitting");
      return;
    }

    setLoading(true);
    try {
      await createEventWithGifts({
        title: eventTitle,
        date: eventDate,
        birthdayPersonId,
        gifts: gifts.map((g) => ({
          name: g.name,
          link: g.link,
          estimatedCost: parseFloat(g.estimatedCost),
        })),
        upiId: upiId || undefined,
        phoneNumber: phoneNumber || undefined,
        excludedUserIds: excludedUserIds.length > 0 ? excludedUserIds : undefined,
      });

      toast.success("✅ Event created successfully!");
      router.push(`/admin`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const birthdayPerson = users.find((u) => u.id === birthdayPersonId);

  return (
    <div className="space-y-6">
      {/* Step Indicator - Now 5 steps */}
      <div className="flex gap-2 md:gap-4 mb-8">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex-1">
            <div className={`h-1 rounded-full ${step >= s ? "bg-primary" : "bg-muted"}`} />
            <p className={`text-xs md:text-sm mt-2 text-center font-medium ${step >= s ? "text-foreground" : "text-muted-foreground"}`}>
              Step {s}
            </p>
          </div>
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <Card className="border-2 bg-card hover:shadow-md transition-shadow">
          <div className="p-6 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">📅 Event Details</h2>

            <div>
              <Label className="text-foreground font-medium">Event Title</Label>
              <Input placeholder="Alice's Birthday" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} className="mt-2 bg-background border-border" />
            </div>

            <div>
              <Label className="text-foreground font-medium">Date</Label>
              <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="mt-2 bg-background border-border" />
            </div>

            <div>
              <Label className="text-foreground font-medium">Birthday Person</Label>
              <Select value={birthdayPersonId} onValueChange={setBirthdayPersonId}>
                <SelectTrigger className="mt-2 bg-background border-border">
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      🎂 {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between gap-2 pt-4">
              <Button variant="outline" disabled>Back</Button>
              <Button onClick={() => setStep(2)} disabled={!isStep1Valid} className="bg-primary hover:bg-primary/90">
                Next →
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 2: Member Exclusions */}
      {step === 2 && (
        <Card className="border-2 bg-card hover:shadow-md transition-shadow">
          <div className="p-6 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">👥 Member Exclusions</h2>
            <p className="text-sm text-muted-foreground">
              Select members who should NOT participate in this event. Excluded members will not see this event in their dashboard and will not be charged.
            </p>

            <div className="space-y-3 bg-secondary/30 p-4 rounded border border-border max-h-64 overflow-y-auto">
              {users
                .filter((u) => u.id !== birthdayPersonId)
                .map((user) => (
                  <div key={user.id} className="flex items-center space-x-3 p-2 rounded hover:bg-secondary/50 transition">
                    <Checkbox
                      id={`exclude-${user.id}`}
                      checked={excludedUserIds.includes(user.id)}
                      onCheckedChange={() => toggleUserExclusion(user.id)}
                      className="w-5 h-5"
                    />
                    <Label
                      htmlFor={`exclude-${user.id}`}
                      className="text-foreground cursor-pointer flex-1 mb-0"
                    >
                      {user.name}
                    </Label>
                    {excludedUserIds.includes(user.id) && (
                      <span className="text-xs bg-destructive/20 text-destructive px-2 py-1 rounded">
                        Excluded
                      </span>
                    )}
                  </div>
                ))}
            </div>

            {excludedUserIds.length > 0 && (
              <div className="bg-orange-500/10 p-4 rounded border border-orange-500/30">
                <p className="text-sm font-semibold text-orange-500">
                  {excludedUserIds.length} member(s) excluded
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Cost will be split among {includedUsers.length} participating member(s)
                </p>
              </div>
            )}

            <div className="flex justify-between gap-2 pt-4">
              <Button onClick={() => setStep(1)} variant="outline">Back</Button>
              <Button onClick={() => setStep(3)} className="bg-primary hover:bg-primary/90">
                Next →
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 3: Add Gifts */}
      {step === 3 && (
        <Card className="border-2 bg-card hover:shadow-md transition-shadow">
          <div className="p-6 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">🎁 Add Gifts</h2>

            <div className="space-y-3">
              {gifts.map((gift, idx) => (
                <Card key={gift.id} className="p-4 bg-secondary/50 border-border">
                  <div className="flex justify-between items-center mb-3">
                    <p className="font-semibold text-foreground">Gift #{idx + 1}</p>
                    <button onClick={() => removeGift(gift.id)} disabled={gifts.length === 1} className="text-destructive hover:text-destructive/80 disabled:opacity-50">
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground font-medium">Name</Label>
                      <Input placeholder="Laptop" value={gift.name} onChange={(e) => updateGift(gift.id, "name", e.target.value)} className="mt-2 bg-background border-border" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground font-medium">Cost (₹)</Label>
                      <Input type="number" placeholder="600" value={gift.estimatedCost} onChange={(e) => updateGift(gift.id, "estimatedCost", e.target.value)} className="mt-2 bg-background border-border" min="1" />
                    </div>
                  </div>

                  <div className="mt-3">
                    <Label className="text-xs text-muted-foreground font-medium">Link</Label>
                    <Input placeholder="https://..." value={gift.link} onChange={(e) => updateGift(gift.id, "link", e.target.value)} className="mt-2 bg-background border-border" />
                  </div>

                  {gift.estimatedCost && (
                    <p className="text-xs text-primary font-semibold bg-primary/10 p-2 rounded mt-2">
                      Split: ₹{(parseFloat(gift.estimatedCost) / (includedUsers.length || 1)).toFixed(0)}/person
                    </p>
                  )}
                </Card>
              ))}
            </div>

            <Button onClick={addGift} variant="outline" className="w-full text-primary border-primary">
              <Plus size={18} className="mr-2" /> Add Gift
            </Button>

            <Card className="p-4 bg-primary/10 border border-primary/30">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Gifts</p>
                  <p className="text-xl font-bold text-primary">{gifts.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-xl font-bold text-primary">₹{totalGiftCost.toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">/Person</p>
                  <p className="text-xl font-bold text-primary">₹{splitAmountPerPerson.toFixed(0)}</p>
                </div>
              </div>
            </Card>

            <div className="flex justify-between gap-2 pt-4">
              <Button onClick={() => setStep(2)} variant="outline">Back</Button>
              <Button onClick={() => setStep(4)} disabled={!isStep3Valid} className="bg-primary hover:bg-primary/90">
                Next →
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 4: Payment Info */}
      {step === 4 && (
        <Card className="border-2 bg-card hover:shadow-md transition-shadow">
          <div className="p-6 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">💳 Payment Info</h2>

            <div>
              <Label className="text-foreground font-medium">UPI ID</Label>
              <div className="flex gap-2 mt-2">
                <Input placeholder="name@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="bg-background border-border" />
                {upiId && (
                  <button onClick={() => copyToClipboard(upiId, "UPI")} className="px-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded">
                    {copiedField === "UPI" ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                )}
              </div>
            </div>

            <div>
              <Label className="text-foreground font-medium">Phone</Label>
              <div className="flex gap-2 mt-2">
                <Input placeholder="+91-XXXXXXXXXX" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="bg-background border-border" />
                {phoneNumber && (
                  <button onClick={() => copyToClipboard(phoneNumber, "Phone")} className="px-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded">
                    {copiedField === "Phone" ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-between gap-2 pt-4">
              <Button onClick={() => setStep(3)} variant="outline">Back</Button>
              <Button onClick={() => setStep(5)} className="bg-primary hover:bg-primary/90">
                Review →
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 5: Review & Confirm */}
      {step === 5 && (
        <Card className="border-2 bg-card hover:shadow-md transition-shadow">
          <div className="p-6 space-y-4">
            <h2 className="text-2xl font-bold text-foreground">✅ Review & Create</h2>

            <div className="bg-secondary/50 p-4 rounded border border-border">
              <p className="text-sm text-muted-foreground">📅 Event</p>
              <p className="font-semibold text-foreground">{eventTitle}</p>
              <p className="text-sm text-muted-foreground">{new Date(eventDate).toLocaleDateString("en-IN")} • 🎂 {birthdayPerson?.name}</p>
            </div>

            <div className="bg-secondary/50 p-4 rounded border border-border space-y-2">
              <p className="text-sm text-muted-foreground">🎁 Gifts ({gifts.length})</p>
              {gifts.map((gift, idx) => (
                <div key={gift.id} className="flex justify-between items-start text-sm">
                  <div className="flex-1">
                    <p className="text-foreground font-medium">{idx + 1}. {gift.name}</p>
                    {gift.link && <p className="text-xs text-muted-foreground mt-1">{gift.link}</p>}
                  </div>
                  <span className="font-semibold text-primary">₹{parseFloat(gift.estimatedCost).toFixed(0)}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 flex justify-between font-semibold text-foreground">
                <span>Total Cost</span>
                <span>₹{totalGiftCost.toFixed(0)}</span>
              </div>
            </div>

            {excludedUserIds.length > 0 && (
              <div className="bg-orange-500/10 p-4 rounded border border-orange-500/30">
                <p className="text-sm font-semibold text-orange-500">❌ Excluded Members ({excludedUserIds.length})</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {users
                    .filter((u) => excludedUserIds.includes(u.id))
                    .map((u) => (
                      <span key={u.id} className="text-xs bg-orange-500/20 text-orange-500 px-2 py-1 rounded">
                        {u.name}
                      </span>
                    ))}
                </div>
              </div>
            )}

            <div className="bg-primary/10 p-4 rounded border border-primary/30 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">👥 Participating Members ({includedUsers.length})</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {includedUsers.map((u) => (
                    <span key={u.id} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                      {u.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="border-t border-primary/30 pt-3">
                <p className="text-sm text-muted-foreground">💰 Split Amount per Person</p>
                <p className="text-3xl font-bold text-primary">₹{splitAmountPerPerson.toFixed(0)}</p>
              </div>
            </div>

            {(upiId || phoneNumber) && (
              <div className="bg-secondary/50 p-4 rounded border border-border">
                <p className="text-sm text-muted-foreground">📱 Payment Details</p>
                {upiId && <p className="text-sm text-foreground">UPI: {upiId}</p>}
                {phoneNumber && <p className="text-sm text-foreground">Phone: {phoneNumber}</p>}
              </div>
            )}

            <div className="flex justify-between gap-2 pt-4">
              <Button onClick={() => setStep(4)} variant="outline">Back</Button>
              <Button onClick={handleSubmit} disabled={loading} className="bg-primary hover:bg-primary/90">
                {loading ? "Creating..." : "✅ Create Event"}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
