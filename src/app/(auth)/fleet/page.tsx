import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function FleetPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/onboarding");
  if (profile.role !== "fleet_owner") redirect("/driver");

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Fleet Dashboard</h1>
      <p className="text-slate-600 mt-1">Welcome, {profile.name}</p>
    </main>
  );
}
