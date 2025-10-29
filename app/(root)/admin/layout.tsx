import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSystemAdmin } from "@/lib/queries/admin/is-system-admin";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) redirect("/auth/login");

  const ok = await isSystemAdmin(data.user.id);
  if (!ok) redirect("/dashboard"); 

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
