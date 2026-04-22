import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/checker/sidebar";

export default async function FleetLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, company_name, role")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/onboarding");
  if (profile.role !== "fleet_owner") redirect("/driver");

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar
        userName={profile.name}
        companyName={profile.company_name ?? "Mi flotilla"}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
