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
    .select("name, company_name, role, status, trial_ends_at")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/onboarding");
  if (profile.role !== "fleet_owner") redirect("/driver");
  if (profile.status === "suspended") redirect("/suspended");

  const trialExpired =
    profile.status === "trial" &&
    profile.trial_ends_at &&
    new Date(profile.trial_ends_at) < new Date();

  return (
    <div className="flex h-screen bg-canvas">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar
          userName={profile.name}
          companyName={profile.company_name ?? "Mi flotilla"}
        />
      </div>
      <div className="flex flex-col flex-1 min-h-0">
        {trialExpired && (
          <div className="shrink-0 bg-destructive/10 border-b border-destructive/20 px-4 py-2 text-center text-sm text-destructive font-medium">
            Tu período de prueba venció. Contacta al administrador para continuar.
          </div>
        )}
        <main className="flex-1 overflow-auto pb-14 md:pb-0">
          {children}
        </main>
      </div>
      {/* Mobile bottom nav */}
      <FleetMobileNav />
    </div>
  );
}
