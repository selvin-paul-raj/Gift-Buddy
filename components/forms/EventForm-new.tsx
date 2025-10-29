"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Calendar, IndianRupee, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { createEventWithGifts } from "@/lib/actions/createEvent-new";
import type { User } from "@/lib/types/database.types";

// Helper to safely render error messages
const ErrorMessage = ({ error }: { error: any }) => {
  if (!error) return null;
  const message = typeof error === 'string' ? error : (error as any)?.message;
  return message ? <p className="text-sm text-red-500 mt-1">{message}</p> : null;
};

const eventSchema = z.object({
  title: z.string().min(3, "Title must be longer than 3 characters"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  birthdayPersonId: z.string().min(1, "Select the birthday person"),
  gifts: z.array(
    z.object({
      name: z.string().min(1, "Gift name is required"),
      link: z.string().optional().or(z.literal("")),
      amount: z.any(),
    })
  ).min(1, "Add at least 1 gift"),
  participantUserIds: z.array(z.string()).min(1, "Select at least 1 participant"),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  allUsers: User[];
}

export default function EventForm({ allUsers }: EventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors }, control } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      gifts: [{ name: "", link: "", amount: 0 }],
      participantUserIds: [],
    },
  });

  const { fields: giftFields, append: appendGift, remove: removeGift } = useFieldArray({
    control,
    name: "gifts",
  });

  const birthdayPersonId = watch("birthdayPersonId");
  const selectedParticipants = watch("participantUserIds");

  const onSubmit = async (data: EventFormData) => {
    try {
      setIsSubmitting(true);

      // Filter out empty gift links
      const cleanedGifts = data.gifts.map((gift) => ({
        name: gift.name,
        link: gift.link && gift.link.trim() ? gift.link : undefined,
        amount: gift.amount,
      }));

      const res = await createEventWithGifts({
        title: data.title,
        description: data.description,
        date: data.date,
        birthdayPersonId: data.birthdayPersonId,
        gifts: cleanedGifts,
        participantUserIds: data.participantUserIds,
      });

      if (res.success) {
        toast.success(`🎉 ${res.message}`);
        router.push("/dashboard");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleParticipantToggle = (userId: string) => {
    const updated = selectedParticipants.includes(userId)
      ? selectedParticipants.filter((id) => id !== userId)
      : [...selectedParticipants, userId];
    
    // Update form value
    const form = document.getElementById("participantIds") as any;
    if (form) {
      form.value = updated;
    }
  };

  const selectAllParticipants = () => {
    const allUserIds = allUsers
      .filter((u) => u.id !== birthdayPersonId)
      .map((u) => u.id);
    
    // This should be handled by form state
    const form = document.getElementById("participantIds") as any;
    if (form) {
      form.value = allUserIds;
    }
  };

  const totalGiftsAmount = watch("gifts").reduce((sum, gift) => sum + (gift.amount || 0), 0);
  const perPersonAmount = selectedParticipants.length > 0 ? totalGiftsAmount / selectedParticipants.length : 0;

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create Birthday Event</h1>
            <p className="text-muted-foreground">Plan gifts and track contributions</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Event Details */}
          <Card className="border-primary/20 shadow-lg lg:col-span-1">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Event Details
              </CardTitle>
              <CardDescription>Basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <Label htmlFor="title">Event Title *</Label>
                <Input 
                  id="title"
                  {...register("title")} 
                  placeholder="Tania's Birthday" 
                />
                {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Event details..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="date">Event Date *</Label>
                <Input 
                  id="date"
                  type="date" 
                  {...register("date")} 
                />
                {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date.message}</p>}
              </div>

              <div>
                <Label htmlFor="birthdayPerson">Birthday Person *</Label>
                <Select {...register("birthdayPersonId")}>
                  <SelectTrigger id="birthdayPerson">
                    <SelectValue placeholder="Select person" />
                  </SelectTrigger>
                  <SelectContent>
                    {allUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.birthdayPersonId && <p className="text-sm text-red-500 mt-1">{errors.birthdayPersonId.message}</p>}
              </div>

              {totalGiftsAmount > 0 && selectedParticipants.length > 0 && (
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Gift Amount</p>
                  <p className="text-2xl font-bold text-primary flex items-center gap-2">
                    <IndianRupee className="h-6 w-6" />
                    {totalGiftsAmount.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    ₹{perPersonAmount.toFixed(2)} per person ({selectedParticipants.length} contributors)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gifts */}
          <Card className="border-primary/20 shadow-lg lg:col-span-2">
            <CardHeader className="bg-gradient-to-r from-secondary/10 to-primary/10">
              <CardTitle className="flex items-center gap-2">
                🎁 Gifts *
              </CardTitle>
              <CardDescription>Add items to purchase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {giftFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-3 bg-muted/50">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Gift {index + 1}</h4>
                    {giftFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGift(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label>Gift Name *</Label>
                    <Input 
                      {...register(`gifts.${index}.name`)}
                      placeholder="e.g., Smart Watch"
                    />
                    {errors.gifts?.[index]?.name && (
                      <ErrorMessage error={errors.gifts[index]?.name} />
                    )}
                  </div>

                  <div>
                    <Label>Amount (₹) *</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="number"
                        step="0.01"
                        className="pl-10"
                        {...register(`gifts.${index}.amount`, { valueAsNumber: true })}
                        placeholder="5000"
                      />
                    </div>
                    {errors.gifts?.[index]?.amount && (
                      <ErrorMessage error={errors.gifts[index]?.amount} />
                    )}
                  </div>

                  <div>
                    <Label>Link (Optional)</Label>
                    <Input 
                      type="url"
                      {...register(`gifts.${index}.link`)}
                      placeholder="https://amazon.in/..."
                    />
                    {errors.gifts?.[index]?.link && (
                      <ErrorMessage error={errors.gifts[index]?.link} />
                    )}
                  </div>
                </div>
              ))}

              {errors.gifts && typeof errors.gifts === 'object' && 'message' in errors.gifts && (
                <p className="text-sm text-red-500">{errors.gifts.message}</p>
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => appendGift({ name: "", link: "", amount: 0 })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Gift
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Participants */}
        <Card className="border-primary/20 shadow-lg mt-6">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Select Contributors *
            </CardTitle>
            <CardDescription>({selectedParticipants.length} selected)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={selectAllParticipants}
            >
              Select All
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {allUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${
                    selectedParticipants.includes(user.id)
                      ? "bg-primary/10 border-primary"
                      : "hover:border-primary/50"
                  } ${user.id === birthdayPersonId ? "opacity-50 pointer-events-none bg-muted" : ""}`}
                  onClick={() => user.id !== birthdayPersonId && handleParticipantToggle(user.id)}
                >
                  <Checkbox
                    checked={selectedParticipants.includes(user.id)}
                    disabled={user.id === birthdayPersonId}
                  />
                  <span className="font-medium flex-1">{user.name}</span>
                  {user.id === birthdayPersonId && <span className="text-xs text-muted-foreground">(Birthday)</span>}
                </div>
              ))}
            </div>

            {errors.participantUserIds && (
              <p className="text-sm text-red-500">{errors.participantUserIds.message}</p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between mt-8 gap-4">
          <Button 
            type="button"
            variant="outline" 
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-gradient-to-r from-primary to-secondary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Event"}
          </Button>
        </div>
      </form>
    </div>
  );
}
