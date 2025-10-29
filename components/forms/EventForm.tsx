"use client";

import { useState, useEffect } from "react";
import { redirect, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Calendar, IndianRupee, ArrowLeft } from "lucide-react";
import { createEvent } from "@/lib/actions/createEvent";

const eventSchema = z.object({
  title: z.string().min(3, "Title must be longer than 3 characters"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  amount: z.string().refine((val) => !isNaN(Number(val)), "Must be a number"),
  birthdayPersonId: z.string().min(1, "Select the birthday person"),
  participantIds: z.array(z.string()).min(1, "Select at least 1 participant"),
  foodOptions: z.array(z.string()).min(1, "Add at least 1 food option"),
  upiId: z.string().optional(),
  phoneNumber: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function EventForm({
  teamId,
  teamMembers,
  totalMemberCount,
}: {
  teamId: string;
  teamMembers: { id: string; name: string }[];
  totalMemberCount: number;
}) {
  const router = useRouter();
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [foodOptions, setFoodOptions] = useState<string[]>([]);
  const [foodInput, setFoodInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: { 
      participantIds: [], 
      foodOptions: [],
    },
  });

  const birthdayPersonId = watch("birthdayPersonId");

  // Remove birthday person from selected participants
  useEffect(() => {
    if (birthdayPersonId) {
      setSelectedMembers((prev) => {
        const updated = prev.filter((id) => id !== birthdayPersonId);
        setValue("participantIds", updated);
        return updated;
      });
    }
  }, [birthdayPersonId, setValue]);

  const onSubmit = async (data: EventFormData) => {
    try {
      setIsSubmitting(true);
      const res = await createEvent({
        ...data,
        amount: Number(data.amount),
        teamId: teamId,
      });
      if (res.success) {
        toast.success("🎉 Event has been successfully created!");
        router.push("/dashboard");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMemberToggle = (id: string) => {
    if (id === birthdayPersonId) return;
    const updated = selectedMembers.includes(id)
      ? selectedMembers.filter((m) => m !== id)
      : [...selectedMembers, id];
    setSelectedMembers(updated);
    setValue("participantIds", updated);
  };

  const addFoodOption = () => {
    if (foodInput.trim() && !foodOptions.includes(foodInput.trim())) {
      const updated = [...foodOptions, foodInput.trim()];
      setFoodOptions(updated);
      setValue("foodOptions", updated);
      setFoodInput("");
    }
  };

  const removeFoodOption = (food: string) => {
    const updated = foodOptions.filter((f) => f !== food);
    setFoodOptions(updated);
    setValue("foodOptions", updated);
  };

  return (
    <div className="min-h-screen bg-black p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Create Birthday Event</h1>
            <p className="text-gray-400">Total Members: {totalMemberCount}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Event Details */}
          <Card className="bg-slate-800 border-slate-700 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-900 to-slate-800">
              <CardTitle className="flex items-center gap-2 text-white">
                <Calendar className="h-5 w-5 text-blue-400" />
                Event Details
              </CardTitle>
              <CardDescription className="text-gray-400">Basic information about the event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <Label htmlFor="title" className="text-gray-300">Event Title *</Label>
                <Input 
                  id="title"
                  {...register("title")} 
                  placeholder="Tania's Birthday"
                  className="bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                />
                {errors.title && <p className="text-sm text-red-400 mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-300">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Celebration details..."
                  className="bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="date" className="text-gray-300">Event Date *</Label>
                <Input 
                  id="date"
                  type="date" 
                  {...register("date")}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                {errors.date && <p className="text-sm text-red-400 mt-1">{errors.date.message}</p>}
              </div>

              <div>
                <Label htmlFor="amount" className="text-gray-300">Target Contribution (₹) *</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input 
                    id="amount"
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-gray-400" 
                    placeholder="50000" 
                    {...register("amount")} 
                  />
                </div>
                {errors.amount && <p className="text-sm text-red-400 mt-1">{errors.amount.message}</p>}
              </div>

              <div>
                <Label htmlFor="birthdayPerson" className="text-gray-300">Who is the birthday person? *</Label>
                <Select onValueChange={(val) => setValue("birthdayPersonId", val)}>
                  <SelectTrigger id="birthdayPerson" className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select a person" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {teamMembers.map((m) => (
                      <SelectItem key={m.id} value={m.id} className="text-white bg-slate-700 focus:bg-slate-600">
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.birthdayPersonId && <p className="text-sm text-red-400 mt-1">{errors.birthdayPersonId.message}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Participants */}
          <Card className="bg-slate-800 border-slate-700 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-900 to-slate-800">
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-blue-400" />
                Select Participants *
              </CardTitle>
              <CardDescription className="text-gray-400">({selectedMembers.length} selected)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const allExceptBirthday = teamMembers
                    .filter((m) => m.id !== birthdayPersonId)
                    .map((m) => m.id);
                  setSelectedMembers(allExceptBirthday);
                  setValue("participantIds", allExceptBirthday);
                }}
                className="border-slate-600 bg-slate-700 text-gray-300 hover:bg-slate-600"
              >
                Select All
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedMembers([]);
                  setValue("participantIds", []);
                }}
                className="border-slate-600 bg-slate-700 text-gray-300 hover:bg-slate-600"
              >
                Clear All
              </Button>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {teamMembers.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedMembers.includes(m.id)
                        ? "bg-blue-900 border-blue-700 text-blue-200"
                        : "border-slate-600 bg-slate-700 text-gray-300 hover:border-blue-500"
                    } ${m.id === birthdayPersonId ? "opacity-50 pointer-events-none bg-slate-600 text-gray-500" : ""}`}
                    onClick={() => handleMemberToggle(m.id)}
                  >
                    <span className="font-medium">{m.name}</span>
                    {m.id === birthdayPersonId && <span className="ml-2 text-sm text-gray-400">(Birthday Person)</span>}
                  </div>
                ))}
              </div>
              {errors.participantIds && <p className="text-sm text-red-400">{errors.participantIds.message}</p>}
              <div className="bg-blue-950 border border-blue-700 rounded-lg p-3 text-xs text-blue-200">
                <p className="font-semibold mb-1">ℹ️ How Split Works:</p>
                <p>• You (admin) + selected participants will split the amount equally</p>
                <p>• Everyone including you will get a payment reminder</p>
                <p>• You'll see everyone's payment status on the admin dashboard</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Details - Full Width */}
        <Card className="bg-slate-800 border-slate-700 shadow-lg mt-6 border-2 border-green-700">
          <CardHeader className="bg-gradient-to-r from-green-900 to-slate-800">
            <CardTitle className="flex items-center gap-2 text-white">
              💳 Payment Details (Your Contact Info)
            </CardTitle>
            <CardDescription className="text-gray-400">Share your UPI ID & phone so others know how to pay you</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2 pt-6">
            <div>
              <Label htmlFor="upiId" className="text-gray-300 font-semibold">UPI ID 💸</Label>
              <Input 
                id="upiId"
                {...register("upiId")} 
                placeholder="e.g., yourname@upi or yourname@okhdfcbank"
                className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to not share your UPI</p>
              {errors.upiId && <p className="text-sm text-red-400 mt-1">{errors.upiId.message}</p>}
            </div>

            <div>
              <Label htmlFor="phoneNumber" className="text-gray-300 font-semibold">Phone Number 📱</Label>
              <Input 
                id="phoneNumber"
                {...register("phoneNumber")} 
                placeholder="+91-XXXXXXXXXX"
                className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to not share your phone</p>
              {errors.phoneNumber && <p className="text-sm text-red-400 mt-1">{errors.phoneNumber.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Food Options */}
        <Card className="bg-slate-800 border-slate-700 shadow-lg mt-6">
          <CardHeader className="bg-gradient-to-r from-blue-900 to-slate-800">
            <CardTitle className="flex items-center gap-2 text-white">🍽️ Food Options *</CardTitle>
            <CardDescription className="text-gray-400">Add at least 1 food option for voting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex gap-2">
              <Input
                value={foodInput}
                onChange={(e) => setFoodInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFoodOption())}
                placeholder="e.g. Pizza, Cake, Biryani..."
                className="bg-slate-700 border-slate-600 text-white placeholder-gray-400"
              />
              <Button type="button" onClick={addFoodOption} className="bg-blue-600 hover:bg-blue-700 text-white">
                Add
              </Button>
            </div>
            {foodOptions.length > 0 && (
              <div className="space-y-2">
                {foodOptions.map((food) => (
                  <div
                    key={food}
                    className="flex items-center justify-between border border-slate-600 p-3 rounded-lg bg-slate-700"
                  >
                    <span className="font-medium text-white">{food}</span>
                    <Button 
                      type="button"
                      variant="destructive" 
                      size="sm" 
                      onClick={() => removeFoodOption(food)}
                      className="bg-red-900 text-red-300 hover:bg-red-800"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {errors.foodOptions && <p className="text-sm text-red-400">{errors.foodOptions.message}</p>}
          </CardContent>
        </Card>

        <div className="flex justify-between mt-8 gap-4">
          <Button 
            type="button"
            variant="outline" 
            onClick={() => router.back()}
            className="border-slate-700 bg-slate-800 text-gray-300 hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Event"}
          </Button>
        </div>
      </form>
    </div>
  );
}
