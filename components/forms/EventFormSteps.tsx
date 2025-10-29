"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Users, Calendar, IndianRupee, ArrowLeft, ChevronRight, ChevronLeft, Copy, Check } from "lucide-react";
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

interface EventFormStepsProps {
  teamId: string;
  teamMembers: { id: string; name: string }[];
  totalMemberCount: number;
}

export default function EventFormSteps({
  teamId,
  teamMembers,
  totalMemberCount,
}: EventFormStepsProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [foodOptions, setFoodOptions] = useState<string[]>([]);
  const [foodInput, setFoodInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors }, trigger } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    mode: "onChange",
    defaultValues: { 
      participantIds: [], 
      foodOptions: [],
    },
  });

  const birthdayPersonId = watch("birthdayPersonId");
  const title = watch("title");
  const description = watch("description");
  const date = watch("date");
  const amount = watch("amount");
  const upiId = watch("upiId");
  const phoneNumber = watch("phoneNumber");

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

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

  const validateStep = async (step: number) => {
    switch (step) {
      case 1:
        return await trigger(["title", "date", "amount", "birthdayPersonId"]);
      case 2:
        return selectedMembers.length > 0 && foodOptions.length > 0;
      case 3:
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (await validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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
            <p className="text-gray-400">Step {currentStep} of 4 • Total Members: {totalMemberCount}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex-1">
            <div className={`h-2 rounded-full ${step <= currentStep ? "bg-blue-600" : "bg-slate-700"}`} />
            <p className="text-xs text-gray-400 mt-1 text-center">Step {step}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* STEP 1: Event Details */}
        {currentStep === 1 && (
          <Card className="bg-slate-800 border-slate-700 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-900 to-slate-800">
              <CardTitle className="flex items-center gap-2 text-white">
                <Calendar className="h-5 w-5 text-blue-400" />
                Step 1: Event Details
              </CardTitle>
              <CardDescription className="text-gray-400">Basic information about the birthday event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div>
                <Label htmlFor="title" className="text-gray-300">Event Title *</Label>
                <Input 
                  id="title"
                  {...register("title")} 
                  placeholder="e.g., Tania's Birthday Celebration"
                  className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 mt-2"
                />
                {errors.title && <p className="text-sm text-red-400 mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-300">Description (Optional)</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="e.g., Let's celebrate with a great party!"
                  className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 mt-2"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="text-gray-300">Event Date *</Label>
                  <Input 
                    id="date"
                    type="date" 
                    {...register("date")}
                    className="bg-slate-700 border-slate-600 text-white mt-2"
                  />
                  {errors.date && <p className="text-sm text-red-400 mt-1">{errors.date.message}</p>}
                </div>

                <div>
                  <Label htmlFor="amount" className="text-gray-300">Target (₹) *</Label>
                  <div className="relative mt-2">
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
              </div>

              <div>
                <Label htmlFor="birthdayPerson" className="text-gray-300">Birthday Person *</Label>
                <Select onValueChange={(val) => setValue("birthdayPersonId", val)}>
                  <SelectTrigger id="birthdayPerson" className="bg-slate-700 border-slate-600 text-white mt-2">
                    <SelectValue placeholder="Select the birthday person" />
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
        )}

        {/* STEP 2: Participants & Food */}
        {currentStep === 2 && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Participants */}
            <Card className="bg-slate-800 border-slate-700 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-900 to-slate-800">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="h-5 w-5 text-blue-400" />
                  Step 2a: Participants
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
                  className="border-slate-600 bg-slate-700 text-gray-300 hover:bg-slate-600 w-full"
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
                  className="border-slate-600 bg-slate-700 text-gray-300 hover:bg-slate-600 w-full"
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
                      {m.id === birthdayPersonId && <span className="ml-2 text-sm text-gray-400">(Birthday)</span>}
                    </div>
                  ))}
                </div>
                {selectedMembers.length === 0 && <p className="text-sm text-red-400">Select at least 1 participant</p>}
              </CardContent>
            </Card>

            {/* Food Options */}
            <Card className="bg-slate-800 border-slate-700 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-900 to-slate-800">
                <CardTitle className="flex items-center gap-2 text-white">🍽️ Step 2b: Food Options</CardTitle>
                <CardDescription className="text-gray-400">({foodOptions.length} added)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex gap-2">
                  <Input
                    value={foodInput}
                    onChange={(e) => setFoodInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFoodOption())}
                    placeholder="e.g., Pizza, Biryani, Cake"
                    className="bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                  />
                  <Button type="button" onClick={addFoodOption} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Add
                  </Button>
                </div>
                {foodOptions.length > 0 && (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
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
                {foodOptions.length === 0 && <p className="text-sm text-red-400">Add at least 1 food option</p>}
              </CardContent>
            </Card>
          </div>
        )}

        {/* STEP 3: Payment Contact Info */}
        {currentStep === 3 && (
          <Card className="bg-slate-800 shadow-lg border-2 border-green-700">
            <CardHeader className="bg-gradient-to-r from-green-900 to-slate-800">
              <CardTitle className="flex items-center gap-2 text-white">
                💳 Step 3: Payment Contact Info
              </CardTitle>
              <CardDescription className="text-gray-400">Share your UPI ID & phone so contributors can pay you</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2 pt-6">
              <div>
                <Label htmlFor="upiId" className="text-gray-300 font-semibold">UPI ID 💸</Label>
                <div className="flex gap-2 mt-2">
                  <Input 
                    id="upiId"
                    {...register("upiId")} 
                    placeholder="e.g., yourname@upi or yourname@okhdfcbank"
                    className="bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                  />
                  {upiId && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(upiId, "UPI ID")}
                      className="px-3 py-2 bg-green-700 hover:bg-green-600 rounded transition-colors flex items-center justify-center flex-shrink-0"
                      title="Copy UPI ID"
                    >
                      {copiedField === "UPI ID" ? (
                        <Check size={18} className="text-white" />
                      ) : (
                        <Copy size={18} className="text-white" />
                      )}
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Optional - Leave empty to not share</p>
                {errors.upiId && <p className="text-sm text-red-400 mt-1">{errors.upiId.message}</p>}
              </div>

              <div>
                <Label htmlFor="phoneNumber" className="text-gray-300 font-semibold">Phone Number 📱</Label>
                <div className="flex gap-2 mt-2">
                  <Input 
                    id="phoneNumber"
                    {...register("phoneNumber")} 
                    placeholder="+91-XXXXXXXXXX"
                    className="bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                  />
                  {phoneNumber && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(phoneNumber, "Phone")}
                      className="px-3 py-2 bg-blue-700 hover:bg-blue-600 rounded transition-colors flex items-center justify-center flex-shrink-0"
                      title="Copy Phone Number"
                    >
                      {copiedField === "Phone" ? (
                        <Check size={18} className="text-white" />
                      ) : (
                        <Copy size={18} className="text-white" />
                      )}
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Optional - Leave empty to not share</p>
                {errors.phoneNumber && <p className="text-sm text-red-400 mt-1">{errors.phoneNumber.message}</p>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 4: Review & Confirm */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <Card className="bg-slate-800 shadow-lg border-2 border-yellow-700">
              <CardHeader className="bg-gradient-to-r from-yellow-900 to-slate-800">
                <CardTitle className="text-white">✅ Step 4: Review & Confirm</CardTitle>
                <CardDescription className="text-gray-400">Please review your event details before creating</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Event Summary */}
                <div className="bg-slate-700 rounded-lg p-4 space-y-2">
                  <h3 className="text-lg font-semibold text-white mb-4">📋 Event Summary</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Title</p>
                      <p className="text-white font-medium">{title || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Date</p>
                      <p className="text-white font-medium">{date || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Target Amount</p>
                      <p className="text-white font-medium">₹{amount || "0"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Birthday Person</p>
                      <p className="text-white font-medium">{teamMembers.find(m => m.id === birthdayPersonId)?.name || "N/A"}</p>
                    </div>
                  </div>
                  {description && (
                    <div className="mt-4 pt-4 border-t border-slate-600">
                      <p className="text-gray-400 text-sm">Description</p>
                      <p className="text-white">{description}</p>
                    </div>
                  )}
                </div>

                {/* Participants Summary */}
                <div className="bg-slate-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">👥 Participants ({selectedMembers.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMembers.map(id => (
                      <span key={id} className="bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-sm">
                        {teamMembers.find(m => m.id === id)?.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Food Options Summary */}
                <div className="bg-slate-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">🍽️ Food Options ({foodOptions.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {foodOptions.map(food => (
                      <span key={food} className="bg-green-900 text-green-200 px-3 py-1 rounded-full text-sm">
                        {food}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Payment Info Summary */}
                {(upiId || phoneNumber) && (
                  <div className="bg-slate-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">💳 Payment Contact</h3>
                    <div className="space-y-3">
                      {upiId && (
                        <div className="flex items-center justify-between bg-slate-600 p-3 rounded">
                          <div>
                            <p className="text-gray-400 text-sm">UPI ID:</p>
                            <p className="text-white font-medium break-all">{upiId}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(upiId, "UPI ID")}
                            className="ml-2 p-2 bg-green-700 hover:bg-green-600 rounded transition-colors flex-shrink-0"
                            title="Copy UPI ID"
                          >
                            {copiedField === "UPI ID" ? (
                              <Check size={16} className="text-white" />
                            ) : (
                              <Copy size={16} className="text-white" />
                            )}
                          </button>
                        </div>
                      )}
                      {phoneNumber && (
                        <div className="flex items-center justify-between bg-slate-600 p-3 rounded">
                          <div>
                            <p className="text-gray-400 text-sm">Phone:</p>
                            <p className="text-white font-medium">{phoneNumber}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(phoneNumber, "Phone")}
                            className="ml-2 p-2 bg-blue-700 hover:bg-blue-600 rounded transition-colors flex-shrink-0"
                            title="Copy Phone Number"
                          >
                            {copiedField === "Phone" ? (
                              <Check size={16} className="text-white" />
                            ) : (
                              <Copy size={16} className="text-white" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 gap-4">
          <Button 
            type="button"
            variant="outline" 
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="border-slate-700 bg-slate-800 text-gray-300 hover:bg-slate-700 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < 4 ? (
            <Button 
              type="button"
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <>
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
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "✅ Create Event"}
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
