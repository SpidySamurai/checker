import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/checker/sidebar";
import { FleetMobileNav } from "@/components/checker/fleet-mobile-nav";

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
    <div className="flex h-screen bg-canvas">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar
          userName={profile.name}
          companyName={profile.company_name ?? "Mi flotilla"}
        />
      </div>
      <main className="flex-1 overflow-auto pb-14 md:pb-0">
        {children}
      </main>
      {/* Mobile bottom nav */}
      <FleetMobileNav />
    </div>
  );
}
