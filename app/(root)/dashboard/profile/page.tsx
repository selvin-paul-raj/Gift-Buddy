"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, ArrowLeft, User, Bell, Shield, Palette } from "lucide-react";
import { toast } from "sonner";

type ProfileData = {
    name: string;
    email: string;
    birthday: string | null;
    upi_id: string | null;
    phone: string | null;
};

export default function ProfilePage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<ProfileData>({
        name: "",
        email: "",
        birthday: "",
        upi_id: null,
        phone: null,
    });

    // Load profile
    useEffect(() => {
        const loadProfile = async () => {
            setLoading(true);
            const { data: userData } = await supabase.auth.getUser();
            if (!userData?.user) {
                router.push("/auth/login");
                return;
            }

            const { data: userProfile } = await supabase
                .from("users")
                .select("*")
                .eq("id", userData.user.id)
                .single();

            setProfile({
                name: userProfile?.name || userData.user.email?.split("@")[0] || "",
                email: userData.user.email || "",
                birthday: userProfile?.birthday || "",
                upi_id: userProfile?.upi_id || null,
                phone: userProfile?.phone || null,
            });
            setLoading(false);
        };

        loadProfile();
    }, [router, supabase]);

    const handleSave = async () => {
        const supabase = createClient();

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not logged in");

            const { error } = await supabase
                .from("users")
                .update({
                    name: profile.name,
                    birthday: profile.birthday,
                    upi_id: profile.upi_id,
                    phone: profile.phone,
                })
                .eq("id", user.id);

            if (error) throw error;

            toast.success("Your profile information has been saved successfully.");
        } catch (err) {
            console.error("handleSave error:", err);
            toast.error(err instanceof Error ? err.message : "Unknown error");
        }
    };

    if (loading) return <p className="p-6">Loading...</p>;

    return (
        <div className="min-h-screen bg-background p-4 space-y-6">
            <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Profile & Settings ⚙️</h1>
                    <p className="text-muted-foreground">Manage your personal information</p>
                </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Personal Information
                        </CardTitle>
                        <CardDescription>Update your profile information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Email</Label>
                                <Input disabled value={profile.email} />
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="birthday">Birthday</Label>
                                <Input
                                    id="birthday"
                                    type="date"
                                    value={profile.birthday || ""}
                                    onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="upiId">UPI ID 💸</Label>
                                <Input
                                    id="upiId"
                                    placeholder="e.g., yourname@upi or yourname@okhdfcbank"
                                    value={profile.upi_id || ""}
                                    onChange={(e) => setProfile({ ...profile, upi_id: e.target.value || null })}
                                />
                                <p className="text-xs text-gray-500 mt-1">Leave empty to not share your UPI</p>
                            </div>
                            <div>
                                <Label htmlFor="phone">Phone Number 📱</Label>
                                <Input
                                    id="phone"
                                    placeholder="e.g., +91 9876543210"
                                    value={profile.phone || ""}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value || null })}
                                />
                                <p className="text-xs text-gray-500 mt-1">Leave empty to not share your phone</p>
                            </div>
                        </div>
                        <Button onClick={handleSave} className="w-full">
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </Button>
                    </CardContent>
                </Card>

            </div>

        </div>
    );
}
